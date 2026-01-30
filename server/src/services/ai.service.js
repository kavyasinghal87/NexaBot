const crypto = require('crypto');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// In-memory cache to ensure identical results for identical code
const auditCache = new Map();

async function analyzeComplexity(code) {
    const systemPrompt = `You are a helper for a code optimization tool. Analyze the provided code for its Time Complexity.
    
    Output strictly in JSON format with the following schema:
    {
        "currentComplexity": "O(n^2)",
        "achievableComplexities": ["O(n log n)", "O(n)"] 
    }
    
    "achievableComplexities" should be a list of *realistic* target complexities that this specific algorithm could be refactored into. If the code is already optimal, return an empty list or ["Already Optimal"].
    Do not include markdown formatting.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: code }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Groq Analysis Error:", error);
        throw new Error("Complexity Analysis failed");
    }
}

async function getAiAudit(code, targetComplexity = null) {
    // 1. Generate SHA-256 hash
    // Include targetComplexity in hash so different targets produce different results
    const hashInput = code.trim() + (targetComplexity || '');
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // 2. Check Cache
    if (auditCache.has(hash)) {
        console.log('⚡ Cache Hit: Returning stored audit result.');
        return auditCache.get(hash);
    }

    // 3. Strict System Prompt
    let systemPrompt = `You are a strict code security auditor. Analyze the provided code (which may be C, C++, JavaScript, etc.) for:
1. Security Vulnerabilities (Focus on Buffer Overflows, Memory Safety for C/C++)
2. Time Complexity (Focus on reducing nested loops)
3. Space Complexity
4. Improvements/Optimizations

STRICTLY FOLLOW THESE RISK LEVEL DEFINITIONS:
- "High": The code has maximum inefficiency (e.g., O(n^2) or worse) where O(n) or O(log n) is possible. OR contains severe security vulnerabilities (buffer overflow, SQLi).
- "Medium": Moderate inefficiencies (e.g., O(n log n) where O(n) is possible) or suboptimal logic that impacts performance but isn't worst-case.
- "Low": The code is almost optimal (O(n) or O(1)) and follows best practices.`;

    if (targetComplexity) {
        systemPrompt += `\n\nCRITICAL INSTRUCTION: The user has requested to optimize this code specifically to achieve a Time Complexity of **${targetComplexity}**. Focus your "fixedCode" and "explanation" on reaching this target.`;
    }

    systemPrompt += `\n\nOutput strictly in JSON format with the following schema:
{
  "fixedCode": "The optimized and fixed version of the code",
  "explanation": "Detailed explanation. You MUST explicitly justify the assigned Risk Level based on the complexity definitions above.",
  "riskLevel": "High" | "Medium" | "Low",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "vulnerabilities": [
    { "line": 5, "type": "Buffer Overflow", "description": "Unsafe use of gets()" }
  ],
  "optimizations": [
     { "line": 5, "type": "Memory Fix", "description": "Replaced gets() with fgets()" }
  ]
}
Do not include markdown formatting (like \`\`\`json), just the raw JSON string.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: code }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        const result = JSON.parse(content);

        // 4. Store in Cache
        auditCache.set(hash, result);

        return result;
    } catch (error) {
        console.error("Groq AI Error:", error);
        throw new Error("AI Audit failed");
    }
}

async function analyzeComparison(codeA, codeB) {
    const systemPrompt = `You are a strict code auditor. Analyze specific provided code snippets "Candidate A" and "Candidate B".
    
    For EACH snippet:
    1. Check if it is valid, compilable code (C, C++, JS, Python, etc.).
    2. Identify its Time Complexity (Big O).
    
    Output strictly in JSON format with the following schema:
    {
        "A": {
            "valid": true,
            "error": null, // or "Missing semicolon" etc if invalid
            "complexity": "O(n^2)" 
        },
        "B": {
            "valid": true,
            "error": null,
            "complexity": "O(n log n)"
        }
    }
    
    If code is invalid, set "valid": false and provide a short "error" message.
    Do not include markdown formatting.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Candidate A:\n${codeA}\n\nCandidate B:\n${codeB}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Groq Comparison Error:", error);
        throw new Error("Comparison Analysis failed");
    }
}


async function generateTestCases(code) {
    const systemPrompt = `You are a Senior QA Engineer & C++ Compiler Expert. Analyze the provided C/C++ code and generate 5-10 rigorously defined test cases.

    CRITICAL RULES:
    1. **Trace Control Flow**: Analyze if the code loops or processes single input.
       - If code reads ONE variable (e.g., \`cin >> n;\`) and exits, the input MUST contain ONLY that one variable. Do NOT provide a stream of numbers ("2 5 1") unless the code explicitly loops to consume them.
    2. **Input Types**: Strictly match the type (int vs float vs char).
       - If \`int\`, do NOT use decimals or characters.
    3. **Overflow Handling**:
       - Check if variables are \`int\` (max 2,147,483,647). Do NOT generate inputs > 2 Billion unless \`long long\` is used.
    4. **No Empty Data**: Input string MUST NOT be empty. Expected Output MUST NOT be empty.
    5. **Edge Cases**: Include 0, max_int boundary.
       - **Negative Numbers**: ONLY include negative numbers if logic allows (e.g., simple addition). If code implies non-negative domain (e.g., factorial, array size, \`unsigned\`), DO NOT generate negative inputs.

    Output strictly in JSON format as an array of objects:
    [
        { "input": "5", "expectedOutput": "10", "description": "Standard positive integer" }
    ]
    
    Calculate "expectedOutput" by mentally running the code with 100% mathematical precision.
    Do not include markdown.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: code }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Lower temperature for precision
            response_format: { type: "json_object" }
        });

        // The model might wrap the array in a key like "testCases", so we handle both
        const content = JSON.parse(completion.choices[0]?.message?.content);
        return Array.isArray(content) ? content : (content.testCases || []);
    } catch (error) {
        console.error("Groq Test Gen Error:", error);
        throw new Error("Test Case Generation failed");
    }
}

async function runVirtualTestBench(code, testCases) {
    // testCases is an array of { input, expectedOutput }
    const systemPrompt = `You are a Strict C/C++ Execution Engine.
    Simulate the execution of the provided code against the provided input test cases.
    
    EXECUTION RULES:
    1. **Strict I/O Simulation**:
       - If code performs \`cin >> n\` ONCE, it consumes only the first token. Subsequent tokens in 'input' are IGNORED.
       - Output MUST reflect this exactly. Do not hallucinate processing of ignored inputs.
    2. **Logical Consistency**:
       - If input is consumed, the output MUST immediately follow the code's logic.
    3. **Format**:
       - Passthrough exact stdout.
    
    For EACH test case, return:
    - passed: boolean (Compare actual vs expected after trimming whitespace)
    - actualOutput: string
    - logs: array of strings (trace steps)
    
    Output strictly in JSON format:
    {
       "results": [
           { "id": 0, "passed": true, "actualOutput": "15", "logs": ["Read n=5", "Output 15"] }
       ]
    }
    
    Do not include markdown.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `CODE:\n${code}\n\nTEST CASES JSON:\n${JSON.stringify(testCases)}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.0, // Strict deterministic execution
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Groq Virtual Run Error:", error);
        throw new Error("Virtual Execution failed");
    }
}

module.exports = { getAiAudit, analyzeComplexity, analyzeComparison, generateTestCases, runVirtualTestBench };
