const { generateTestCases } = require('../services/ai.service');
const { executeCode } = require('../services/execution.service');

async function getTestCases(req, res) {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        console.log("Generating Test Cases...");
        const cases = await generateTestCases(code);
        res.json({ testCases: cases });

    } catch (error) {
        console.error("Test Case Gen Controller Error:", error);
        res.status(500).json({ error: "Failed to generate test cases" });
    }
}

async function runVirtual(req, res) {
    try {
        const { code, testCases } = req.body;
        if (!code || !testCases) {
            return res.status(400).json({ error: "Code and Test Cases are required" });
        }

        console.log("Running Real Runtime Execution...");

        // Execute each test case
        const results = await Promise.all(testCases.map(async (tc) => {
            const result = await executeCode(code, tc.input);
            const passed = tc.expectedOutput && result.actualOutput.trim() === tc.expectedOutput.trim();

            return {
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                actualOutput: result.error ? `Error: ${result.error}` : result.actualOutput,
                passed: !result.error && passed,
                error: result.error
            };
        }));

        res.json({ results });

    } catch (error) {
        console.error("Runtime Execution Error:", error);
        res.status(500).json({ error: "Failed to execute code" });
    }
}

module.exports = { getTestCases, runVirtual };
