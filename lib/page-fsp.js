/*
   Copyright 2019 Locomote Ltd.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

const Cheerio = require('cheerio');

const { FilesetProcessor } = require('./processor');

const MetaNamePrefix = 'locomote:';

const FrontmatterMetaName = 'locomote:frontmatter';

// Get the indexable content of a page or post. Returns the text content
// of the element with ID = 'content'.
function readIndexableContent( html ) {
    let text = '';
    if( html ) {
        // Extract text content from post HTML.
        text = Cheerio.load( html ).text();
        // Strip extraneous whitespace.
        text = text.split(/\s+/g).join(' ');
    }
    return text;
}

/**
 * An HTML pages fileset processor.
 * This fileset processor is used to build the file DB representation of HTML
 * pages by parsing the file contents and extracting certain key values.
 * At a minimum, the processor reads the page title from its <title> element,
 * and the page's HTML content from its <body> element. This behaviour can be
 * modified and extended by including <meta> elements in the HTML with the
 * following names:
 * - locomote.selector.content: Specify an alternative CSS selector for the
 *   page content; the default value is 'body'.
 * - locomote.page.title: Specify the page title. Overrides the <title> element.
 * - locomote.page.type: The page type; defaults to 'page'.
 * - locomote.page.sort: The page sort order.
 * - locomote.page.image: Specify the path to an image to associate with the page.
 * - locomote.page.meta: JSON encoded page meta data.
 * - keywords: Extract page keywords.
 */
class PageFSP extends FilesetProcessor {

    constructor( loader, category ) {
        super( loader, category );
    }

    /**
     * Make a file record.
     * @param ctx       A request context.
     * @param path      The path of the file being processed.
     * @param active    A flag indicating whether the file is active.
     * @param version   The file version (e.g. commit hash).
     */
    async makeFileRecord( ctx, path, active, version ) {
        const record = await super.makeFileRecord( ctx, path, active, version );
        if( record.status == 'deleted' ) {
            return false;
        }
        const html = await this.readContents( ctx, path, version );
        // Parse the HTML.
        const $ = Cheerio.load( html.toString() );
        // Initialize 'page' property on the record.j
        let page = {
            title:  $('title').text()
        };

        // TODO: Currently, effectively two methods supported for storing
        // page metadata/frontmatter in the page; need to establish which
        // is best, of it an alternative approach should be taken.

        // Defaults vars.
        //let contentSel = 'body';
        // Process the page's meta data.
        $('meta').each( ( idx, meta ) => {
            const $meta = $( meta );
            const name  = $meta.attr('name');
            if( !name ) return; // Not every meta tag has a name.
            const value = $meta.attr('content');
            // Method 1: Entire frontmatter JSON encoded into a single meta tag.
            if( name === FrontmatterMetaName ) {
                // Note that JSON value should be base64 encoded.
                const json = Buffer.from( value, 'base64').toString();
                const fm = JSON.parse( json );
                // Filter out properties starting with underscore.
                for( const p in fm ) {
                    if( p[0] === '_' ) {
                        delete fm[p];
                    }
                }
                page = Object.assign( page, fm );
            }
            // Method 2: Each frontmatter value placed in tag named locomote:xxx
            else if( name.startsWith( MetaNamePrefix ) ) {
                page[name.substring( MetaNamePrefix.length )] = value;
            }
        });
        // Read the document body content.
        /*
        const body = $( contentSel ).html();
        if( body ) {
            record.page.body = body.trim();
        }
        */
        /*
        // If page image specified then convert path to file ID.
        if( record.page.image ) {
            let image = await this._iddb.get( record.page.image, repoPath );
            if( image ) {
                record.page.image = image.id;
            }
        }
        */
        record.page = page;
        return record;
    }

    async makeSearchRecord( record ) {
        // NOTE This currently won't work due to page content being removed from the record.
        let { id, path, page: { title, content, keywords } } = record;
        content = readIndexableContent( content );
        return { id, path, title, content, keywords };
    }
}

module.exports = { PageFSP }
