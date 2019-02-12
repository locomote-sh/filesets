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

const FS = require('fs');
const { promisify } = require('util');
const _readFile = promisify( FS.readFile );

const { resolve: resolvePath } = require('path');

/**
 * File loader interface for fileset processors.
 * The default implementation loads files directly from the file system and
 * ignores the 'version' argument passed to each of its methods.
 */
class FileLoader {

    /**
     * Create a new file loader.
     */
    FileLoader() {}

    /**
     * Resolve a file path to an absolute path.
     */
    _resolvePath( ctx, path, version ) {
        const { repoPath: _basePath } = ctx;
        return resolvePath( _basePath, path );
    }

    /**
     * Read the contents of the file at the specified path.
     * @param ctx       A request context.
     * @param path      The path of the file to read, relative to the base path.
     * @param version   The version of the file to read; ignored in this implementation.
     * @return Returns a promise which resolves to a Buffer containing the file's contents.
     */
    readFile( ctx, path, version ) {
        const _path = this._resolvePath( ctx, path, version );
        return _readFile( _path );
    }

    /**
     * Pipe the contents of the file at the specified path.
     * @param ctx       A request context.
     * @param path      The path of the file to read, relative to the base path.
     * @param version   The version of the file to read; ignored in this implementation.
     * @param outs      A writeable stream to pipe the contents to.
     * @return Returns a promise which resolves once the file's contents have been fully piped.
     */
    pipeFile( ctx, path, version, outs ) {
        return new Promise( ( resolve, reject ) => {
            const _path = this._resolvePath( ctx, path, version );
            const ins = FS.createReadStream( _path );
            ins.on('error', reject );
            ins.on('close', resolve );
            ins.pipe( outs );
        });
    }

}

exports.FileLoader = FileLoader;
