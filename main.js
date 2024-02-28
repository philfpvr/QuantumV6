const { InstanceBase, runEntrypoint, InstanceStatus } = require('@companion-module/base');
const UpgradeScripts = require('./upgrades');
const UpdateActions = require('./actions');
const UpdateFeedbacks = require('./feedbacks');
const UpdateVariableDefinitions = require('./variables');
const axios = require('axios');

class ModuleInstance extends InstanceBase {
    constructor(internal) {
        super(internal);
        // Initialize variables object
        this.variables = {};
        // Flag to track whether a PUT request is in progress
        this.putRequestInProgress = false;
    }

    async init(config) {
        this.config = config;
    
        this.updateStatus(InstanceStatus.Ok);
    
        // Log initialization
        console.log('Module initialized with config:', config);
    
        // Log variables and their values when the module starts
        console.log('Current variables:');
        for (const variableId in this.variables) {
            if (this.variables.hasOwnProperty(variableId)) {
                console.log(`Variable ID: ${variableId}, Value: ${this.variables[variableId]}`);
            }
        }
    
        this.updateActions(); // Export actions
        this.updateFeedbacks(); // Export feedbacks
        await this.updateVariableDefinitions(); // Export variable definitions
    
        // Log variables and their values after they have been updated from variable definitions
        console.log('Variables after updating definitions:');
        for (const variableId in this.variables) {
            if (this.variables.hasOwnProperty(variableId)) {
                console.log(`Variable ID: ${variableId}, Value: ${this.variables[variableId]}`);
            }
        }
    }

    async configUpdated(config) {
        // Log configuration update
        console.log('Configuration updated with new config:', config);

        this.config = config;
        // Update variables when config is updated
        this.updateVariablesFromConfig();
        // Update actions when config changes
        this.updateActions();
    }

    // Return config fields for web config
    getConfigFields() {
        return [
            {
                type: 'textinput',
                id: 'hostname',
                label: 'Hostname',
                width: 6,
            },
            {
                type: 'textinput',
                id: 'username',
                label: 'Username',
                default: 'root', // Default username
                width: 6,
            },
            {
                type: 'textinput',
                id: 'password',
                label: 'Password',
                default: 'root', // Default password
                width: 6,
            }
        ];
    }

    updateActions() {
        // Log action update
        console.log('Updating actions...');
        UpdateActions(this);
    }

    updateFeedbacks() {
        console.log('Updating feedback definitions...');
        UpdateFeedbacks(this);
    }

    async updateVariableDefinitions() {
        try {
            // Log variable definition update
            console.log('Updating variable definitions...');
            await UpdateVariableDefinitions(this);
            console.log('Variable definitions updated.');
        } catch (error) {
            console.error('Error updating variable definitions:', error.message);
            throw error;
        }
    }

    async httpGet(url, options) {
        try {
            const response = await axios.get(url, options);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async httpPut(url, data, options) {
        try {
            const response = await axios.put(url, data, options);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async myGetRequest(url, username, password) {
        try {
            console.log('Making GET request to:', url);
            
            // Construct auth header
            const authHeader = {
                headers: {
                    Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
                }
            };
            console.log('Request Headers:', authHeader); // Log headers
    
            // Send GET request using Axios
            const response = await axios.get(url, authHeader);
            console.log('Network connection status:', response.status); // Log network connection status
            
            // Check if response exists and contains data
            if (response && response.data) {
                console.log('Received GET response:', response.data);
                // Ensure response data is in the expected format
                if (typeof response.data === 'string') {
                    // Convert response data to lowercase string
                    const responseDataString = response.data.toLowerCase();
                    // Set variable HTTP-GET-Response
                    this.setVariable('HTTP-GET-Response', response.data);
                    console.log('HTTP-GET-Response variable set to:', response.data);
                    return response;
                } else {
                    console.error('Error: Response data is not in the expected format');
                    return null;
                }
            } else {
                console.error('Error: Invalid response or missing data property');
                return null;
            }
        } catch (error) {
            console.error('Error occurred during HTTP GET request:', error.message);
            throw error;
        }
    }
    
    
    
    
    async myPutRequest(url, requestData, username, password) {
        try {
            // Check if a PUT request is already in progress
            if (this.putRequestInProgress) {
                console.warn('PUT request already in progress. Skipping duplicate request.');
                return null; // Return early to prevent duplicate requests
            }
    
            // Set the flag to indicate that a PUT request is now in progress
            this.putRequestInProgress = true;
    
            console.log('Making PUT request to:', url);
            const authHeader = {
                Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
            };
            console.log('Request Headers:', authHeader); // Log headers
    
            const config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: url,
                headers: authHeader
            };
    
            console.log('Constructed PUT request URL:', config.url);
            console.log('Request Headers:', config.headers);
    
            const options = {
                timeout: 5000, // Set timeout to 5 seconds (adjust as needed)
                params: { enabled: true } // Include the query parameters
            };
    
            const response = await axios.request(config);
            console.log('Network connection status:', response.status); // Log network connection status
    
            if (response && response.data) {
                console.log('Received PUT response:', response.data);
                // Check if the response matches the expected format
                if (response.data.alert === 'success') {
                    console.log('Request succeeded');
                    // Set variable HTTP-PUT-Response
                    this.setVariable('HTTP-PUT-Response', response.data);
                    console.log('HTTP-PUT-Response variable set to:', response.data);
                    return response;
                } else {
                    console.error('Error: Invalid response format');
                    return null;
                }
            } else {
                console.error('Error: Invalid response or missing data property');
                return null;
            }
        } catch (error) {
            console.error('Error occurred during HTTP PUT request:', error.message);
            throw error;
        } finally {
            // Reset the flag to indicate that the PUT request is no longer in progress
            this.putRequestInProgress = false;
        }
    }
    
    setVariable(name, value) {
        // Implement the logic to set the variable
        console.log(`Setting variable ${name} to ${value}`);
        // For example, you can store the variable value in a local object
        this.variables[name] = value;
    }
    
    setFeedback(name, value) {
        // Implement the logic to set the feedback
        console.log(`Setting feedback ${name} to ${value}`);
        // For example, you can trigger an event to update the UI with the feedback value
        // In this example, we'll just log the feedback value
        console.log(`Feedback ${name} set to ${value}`);
    }
}

runEntrypoint(ModuleInstance, UpgradeScripts);
