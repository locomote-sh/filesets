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

/**
 * A class for processing file records and contents.
 */
class FilesetProcessor {

    /**
     * Create a new processor.
     * @param loader    A file loader.
     * @param category  The fileset category name.
     */
    constructor( loader, category ) {
        this._loader = loader;
        this._category = category;
    }

    /**
     * Generate a file record from a file path.
     * File records are used to populate the updates feed with info on modified files.
     * @param ctx       A request context.
     * @param path      A file path.
     * @param active    A boolean indicating whether the file is active or not.
     * @param commit    The commit being processed; can be used to read the
     *                  file's data from the appropriate commit.
     */
    makeFileRecord( ctx, path, active, commit ) {
        const category = this._category;
        const status = active ? 'published' : 'deleted';
        const record = { path, category, status };
        return record;
    }

    /**
     * Make category's the search record.
     */
    makeSearchRecord( record ) {
        return record;
    }

    /**
     * Read a file's content.
     */
    readContents( ctx, path, version ) {
        return this._loader.readFile( ctx, path, version );
    }

    /**
     * Pipe a file's contents.
     * @param ctx       A file request context.
     * @param path      The path to the file to pipe.
     * @param version   The version of the file to pipe.
     * @param outs      An output stream to pipe the file to.
     */
    pipeContents( ctx, path, version, outs ) {
        return this._loader.pipeFile( ctx, path, version, outs );
    }
}

exports.FilesetProcessor = FilesetProcessor;
