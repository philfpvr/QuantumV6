module.exports = async function (self) {
    console.log("Setting variable definitions...");
    self.setVariableDefinitions([
        { variableId: 'HTTP-GET-Response', name: 'HTTP GET Response' },
        { variableId: 'HTTP-POST-Response', name: 'HTTP POST Response' },
        { variableId: 'HTTP-PUT-Response', name: 'HTTP PUT Response' },
        // Add more variables as needed
    ]);
};
