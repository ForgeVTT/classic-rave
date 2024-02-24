const { ClassicLevel } = require("classic-level");
const { RaveLevel } = require("rave-level");
const crypto = require("crypto");

const sha1 = (data) => {
    return crypto.createHash("sha1").update(data).digest("hex");
};
let kDb = null;

// ClassicRave wrapper includes static methods and methods missing from RaveLevel but present on classic-level
class ClassicRave extends RaveLevel {
    constructor(location, options = {}) {
        let locationHash = null;
        // We need to override the rave socket path using a hash of the location, as unix sockets
        // have a max length of 108 characters and the location can very easily be too long and cause the
        // sockets to fail to connect and enter an infinite loop when rave-level tries to open/connect to the socket.
        if (process.platform === "win32") {
            /*
            Only relevant in Windows testing environments.
            Create a location hash relative to Data, so that the named pipe can be consistent per package in Data.
            */
            const normalizedPath = (location || "").replace(/\//g, "\\");
            const dataPath = "\\Data\\";
            const lastIndexOfData = normalizedPath.lastIndexOf(dataPath);
            if (lastIndexOfData > -1) {
                locationHash = sha1(location.slice(lastIndexOfData));
                options.raveSocketPath = `\\\\.\\pipe\\rave-level\\${locationHash}`;
            }
        } else {
            locationHash = sha1(location);
            options.raveSocketPath = `/tmp/rave-level-${locationHash}.sock`;
        }
        super(location, options);
        // Find and keep track of the symbol that references the ClassicLevel database
        if (!kDb) {
            for (const symbol of Object.getOwnPropertySymbols(this)) {
                if (symbol.description === "db") {
                    // If found, store for future lookups
                    kDb = symbol;
                    break;
                }
            }
        }
    }

    compactRange(start, end, options, callback) {
        if (this[kDb]) {
            return this[kDb].compactRange(start, end, options, callback);
        }
        if (typeof options === "function" && !callback) {
            callback = options;
            options = undefined;
        } else if (typeof options !== "object") {
            options = null;
        }
        if (callback) {
            // Call the callback with null error
            return callback(null);
        }
        return Promise.resolve(0);
    }

    approximateSize(start, end, options, callback) {
        if (this[kDb]) {
            return this[kDb].approximateSize(start, end, options, callback);
        }
        if (typeof options === "function" && !callback) {
            callback = options;
            options = undefined;
        } else if (typeof options !== "object") {
            options = null;
        }
        if (callback) {
            // Call the callback with null error and size of 0 as default
            return callback(null, 0);
        }
        return Promise.resolve(0);
    }

    static destroy(location, callback) {
        return ClassicLevel.destroy(location, callback);
    }

    static repair(location, callback) {
        return ClassicLevel.repair(location, callback);
    }
}

module.exports = {
    ClassicLevel: ClassicRave,
};
