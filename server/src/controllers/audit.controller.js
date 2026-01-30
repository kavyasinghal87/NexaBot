const { getAiAudit, analyzeComplexity: performComplexityAnalysis, analyzeComparison: performComparisonAnalysis } = require('../services/ai.service');
const { saveAuditLog, getUserAudits, deleteUserAudits } = require('../services/appwrite.service');

async function analyzeCode(req, res) {
    try {
        const { code, userId, targetComplexity } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        console.log("Analyzing code for user:", userId || 'Guest');
        if (targetComplexity) {
            console.log("Targeting Complexity:", targetComplexity);
        }

        // 1. Get AI Analysis
        const auditResult = await getAiAudit(code, targetComplexity);

        // 2. Save to Appwrite (if userId is provided)
        let saveError = null;
        if (userId) {
            try {
                await saveAuditLog({
                    userId,
                    originalCode: code,
                    fixedCode: auditResult.fixedCode,
                    explanation: auditResult.explanation,
                    riskLevel: auditResult.riskLevel,
                    timeComplexity: auditResult.timeComplexity,
                    spaceComplexity: auditResult.spaceComplexity
                });
                console.log('✅ Audit saved to database');
            } catch (err) {
                console.error('⚠️ Failed to save audit:', err);
                saveError = err.message || "Failed to save to history";
            }
        } else {
            console.log('⚠️ Audit not saved: No userId provided');
        }

        // 3. Return result with potential save warning
        res.json({ ...auditResult, saveError });

    } catch (error) {
        console.error("Audit Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function analyzeComplexity(req, res) {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "Code is required" });

        const analysis = await performComplexityAnalysis(code);
        res.json(analysis);
    } catch (error) {
        console.error("Complexity Controller Error:", error);
        res.status(500).json({ error: "Failed to analyze complexity" });
    }
}

async function getHistory(req, res) {
    try {
        const { userId } = req.params;
        const audits = await getUserAudits(userId);
        res.json(audits);
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
}

async function purgeHistory(req, res) {
    try {
        const { userId } = req.params;
        const result = await deleteUserAudits(userId);
        res.json({ message: "History purged successfully", count: result.count });
    } catch (error) {
        console.error("Purge History Error:", error);
        // Send the specific error message to the client
        res.status(500).json({
            error: "Failed to purge history",
            details: error.message || error
        });
    }
}

async function compareCode(req, res) {
    try {
        const { codeA, codeB } = req.body;
        if (!codeA || !codeB) return res.status(400).json({ error: "Both Code A and Code B are required" });

        const comparison = await performComparisonAnalysis(codeA, codeB);
        res.json(comparison);
    } catch (error) {
        console.error("Comparison Controller Error:", error);
        res.status(500).json({ error: "Failed to compare code" });
    }
}

module.exports = { analyzeCode, analyzeComplexity, compareCode, getHistory, purgeHistory };
