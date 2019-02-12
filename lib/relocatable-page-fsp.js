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

const Path  = require('path');

const { PageFSP }         = require('./page-fsp');
const { HTMLTransformer } = require('./html-transformer');

/**
 * A relocatable HTML page fileset processor.
 * Relocatable pages are static HTML pages which can be hosted under
 * arbitrary base path locations. This is done by rewriting absolute
 * path URLs within the HTML by prepending a base path to the URL
 * before it is served to the client.
 */
class RelocatablePageFSP extends PageFSP {

    constructor( loader, category ) {
        super( loader, category );
    }

    /**
     * Pipe a file's contents.
     * @param ctx       A file request context.
     * @param path      The path to the file to pipe.
     * @param version   The version of the file to pipe.
     * @param outs      An output stream to pipe the file to.
     */
    async pipeContents( ctx, path, version, outs ) {
        if( Path.extname( path ) == '.html' ) {
            // Prepend the base path the repo is accessed under to absolute
            // paths in HTML content.
            outs = new HTMLTransformer( ctx.basePath, outs );
        }
        return super.pipeContents( ctx, path, version, outs );
    }

}

module.exports = { RelocatablePageFSP }
