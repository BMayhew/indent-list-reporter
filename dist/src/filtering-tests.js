"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUniqueSpecsBySpecName = exports.filterOutDuplicateFailedTestsOnRetry = exports.filterUniqueSuitesByDescription = void 0;
const TestsPerSpecFile_1 = require("./TestsPerSpecFile");
/**
 * Filter out duplicate suites
 * Add reason later //TODO
 * @param inputSuites
 */
const filterUniqueSuitesByDescription = (inputSuites) => {
    const uniqueSuites = [];
    inputSuites.forEach((currentSuite) => {
        const currentSuiteDescription = currentSuite.getSuiteDescription();
        const testCases = currentSuite.getTestCases();
        const existingSuite = uniqueSuites.find((uniqueSuite) => uniqueSuite.getSuiteDescription() === currentSuiteDescription);
        if (existingSuite) {
            existingSuite.setTestCases(existingSuite.getTestCases().concat(testCases));
        }
        else {
            const newUniqueSuite = new TestsPerSpecFile_1.SuiteTestCases(currentSuiteDescription);
            newUniqueSuite.setTestCases(testCases);
            uniqueSuites.push(newUniqueSuite);
        }
    });
    return uniqueSuites;
};
exports.filterUniqueSuitesByDescription = filterUniqueSuitesByDescription;
/**
 * Filter out duplicate test cases
 * We need to filter out duplicate test cases, because when a test is retried and fails again
 * It is logged twice or more times on the console, depending on how many times it is retried
 * @param failedTests
 */
const filterOutDuplicateFailedTestsOnRetry = (failedTests) => {
    const removeDuplicateFailedTests = [];
    failedTests.forEach((failedTest) => {
        const existingTestsCase = removeDuplicateFailedTests.find((myTest) => failedTest.testData.id === myTest.testData.id);
        if (existingTestsCase === undefined) {
            removeDuplicateFailedTests.push(failedTest);
        }
    });
    return removeDuplicateFailedTests;
};
exports.filterOutDuplicateFailedTestsOnRetry = filterOutDuplicateFailedTestsOnRetry;
/**
 * Filter out duplicate specs
 * Add explination later //TODO
 * @param allTests
 */
const filterUniqueSpecsBySpecName = (allTests, areRetried) => {
    const uniqueSpecFiles = [];
    allTests.forEach((currentTest) => {
        const currentSpecName = currentTest.getSpecName();
        const suiteTests = currentTest.getSuiteTests();
        const existingSpec = uniqueSpecFiles.find((spec) => spec.getSpecName() === currentSpecName);
        if (existingSpec) {
            // If currentSpecName is already in uniqueSpecFiles, merge the suiteTests
            existingSpec.setSuiteTests(existingSpec.getSuiteTests().concat(suiteTests));
        }
        else {
            // If currentSpecName is not in uniqueSpecFiles, add it with its data
            const newUniqueSpec = new TestsPerSpecFile_1.TestsPerSpecFile(currentSpecName);
            newUniqueSpec.setSuiteTests(suiteTests);
            uniqueSpecFiles.push(newUniqueSpec);
        }
    });
    uniqueSpecFiles.forEach((spec) => {
        const uniqueSuites = (0, exports.filterUniqueSuitesByDescription)(spec.getSuiteTests());
        spec.setSuiteTests(uniqueSuites);
    });
    //TODO analyse and test what this code block does in more detail, and document it
    if (areRetried || process.env.CI) {
        const specFilteredOutFailedTestCases = uniqueSpecFiles.map((suite) => {
            suite.getSuiteTests().map((suiteTestCases) => {
                const testCasesError = suiteTestCases.getTestCases().map((testCase) => {
                    const testCaseError = {
                        error: testCase.error,
                        testData: testCase,
                        titlePath: testCase.titlePath
                    };
                    return testCaseError;
                });
                const testCasesWithErrors = (0, exports.filterOutDuplicateFailedTestsOnRetry)(testCasesError);
                const testCases = testCasesWithErrors.map((testCase) => {
                    return testCase.testData;
                });
                suiteTestCases.setTestCases(testCases);
            });
            return suite;
        });
        return specFilteredOutFailedTestCases;
    }
    return uniqueSpecFiles;
};
exports.filterUniqueSpecsBySpecName = filterUniqueSpecsBySpecName;
