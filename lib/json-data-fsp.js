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

const { FilesetProcessor } = require('./processor');

/**
 * A JSON data fileset processor.
 * Reads data from the associated JSON file and includes it in the file record.
 */
class JSONDataFSP extends FilesetProcessor {

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
        const json = await this.readFile( ctx, record.path, version );
        // Parse the JSON and assign to the record.
        record.data = JSON.parse( json.toString() );
        return record;
    }

}

module.exports = { JSONDataFSP }
