const axios = require('axios');

module.exports = function (self) {
    // Define action definitions
    self.setActionDefinitions({
        http_get: {
            name: 'HTTP GET Request',
            options: [
                {
                    id: 'additionalPath',
                    type: 'textinput',
                    label: 'Additional Path',
                    default: '',
                },
            ],
            callback: async (event) => {
                try {
                    console.log('Starting HTTP GET request...');
                    const url = `http://${self.config.hostname}/api/streaming/qstreamcfg/udp/${event.options.additionalPath}`;
                    console.log('Constructed GET request URL:', url);
                    const response = await self.myGetRequest(
                        url,
                        self.config.username, // Use username from config
                        self.config.password // Use password from config
                    );
                    console.log('Received HTTP GET response:', response.data);
                    self.setVariable('HTTP-GET-Response', response.data);

                    // Trigger HTTPRequestStatus feedback based on the response
                    const success = response.data.toLowerCase().includes('true');
                    self.setFeedback('HTTPRequestStatus', success);
                } catch (error) {
                    console.error('Error occurred during HTTP GET request:', error.message);
                }
            },
        },
        http_put: {
            name: 'HTTP PUT Request',
            options: [
                {
                    id: 'additionalPath',
                    type: 'textinput',
                    label: 'Additional Path',
                    default: 'enabled',
                },
                {
                    id: 'enabled',
                    type: 'dropdown',
                    label: 'Enabled',
                    default: 'true',
                    choices: [
                        { id: 'true', label: 'True' },
                        { id: 'false', label: 'False' },
                    ],
                },
            ],
            callback: async (event) => {
                try {
                    console.log('Starting HTTP PUT request...');
                    const requestData = { enabled: event.options.enabled === 'true' };
                    const url = `http://${self.config.hostname}/api/streaming/qstreamcfg/udp/${event.options.additionalPath}/?enabled=${event.options.enabled}`;
                    console.log('Constructed PUT request URL:', url);
                    const response = await self.myPutRequest(
                        url,
                        requestData,
                        self.config.username, // Use username from config
                        self.config.password // Use password from config
                    );
                    console.log('Received HTTP PUT response:', response.data);
                    self.setVariable('HTTP-PUT-Response', response.data);

                    // Trigger HTTPRequestStatus feedback based on the response
                    const success = response.data.alert === 'success';
                    self.setFeedback('HTTPRequestStatus', success);
                } catch (error) {
                    console.error('Error occurred during HTTP PUT request:', error.message);
                }
            },
        },
    });
};
