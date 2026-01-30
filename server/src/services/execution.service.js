const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Temporary directory for compilation
const TEMP_DIR = path.join(__dirname, '../../temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Execute C/C++ code with given input
 * @param {string} code 
 * @param {string} input 
 * @returns {Promise<{actualOutput: string, error: string}>}
 */
async function executeCode(code, input) {
    const timestamp = Date.now();
    const sourceFile = path.join(TEMP_DIR, `source_${timestamp}.cpp`);
    const exeFile = path.join(TEMP_DIR, `app_${timestamp}${os.platform() === 'win32' ? '.exe' : ''}`);

    try {
        // 1. Write Source Code
        fs.writeFileSync(sourceFile, code);

        // 2. Compile
        // Use Promise to handle exec for compilation
        await new Promise((resolve, reject) => {
            exec(`g++ -o "${exeFile}" "${sourceFile}"`, (error, stdout, stderr) => {
                if (error) {
                    reject({ message: 'Compilation Failed', detail: stderr || stdout });
                } else {
                    resolve();
                }
            });
        });

        // 3. Execute
        return await new Promise((resolve) => {
            const child = spawn(exeFile);

            let output = '';
            let errorOutput = '';
            let isTimedOut = false;

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                // Cleanup files asynchronously
                fs.unlink(sourceFile, () => { });
                fs.unlink(exeFile, () => { });

                if (isTimedOut) return; // Handled by timeout block

                if (code !== 0) {
                    resolve({
                        actualOutput: output,
                        error: errorOutput || `Process exited with code ${code}`,
                        status: 'runtime_error'
                    });
                } else {
                    resolve({
                        actualOutput: output,
                        error: null,
                        status: 'success'
                    });
                }
            });

            child.on('error', (err) => {
                if (isTimedOut) return;
                fs.unlink(sourceFile, () => { });
                fs.unlink(exeFile, () => { });
                resolve({
                    actualOutput: '',
                    error: 'Execution Error: ' + err.message,
                    status: 'runtime_error'
                });
            });

            // Feed Input
            if (input) {
                child.stdin.write(input);
            }
            child.stdin.end();

            // Timeout (e.g., 2 seconds for strict perf)
            setTimeout(() => {
                isTimedOut = true;
                child.kill();
                resolve({
                    actualOutput: output,
                    error: 'Execution Timed Out (2s limit)',
                    status: 'timeout'
                });
            }, 2000);
        });

    } catch (err) {
        // Build error usually
        if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
        if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);

        return {
            actualOutput: '',
            error: err.detail || err.message,
            status: 'compile_error'
        };
    }
}

module.exports = { executeCode };
