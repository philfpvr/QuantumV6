const { combineRgb } = require('@companion-module/base');

module.exports = function (self) {
    self.setFeedbackDefinitions({
        HTTPRequestStatus: {
            name: 'HTTP Request Status',
            type: 'string',
            label: 'HTTP Request Success',
            defaultStyle: {
                color: combineRgb(0, 0, 0),
            },
            callback: (feedback, value) => {
                console.log('Received value for feedback:', value);
                if (value && typeof value === 'object' && 'enabled' in value) {
                    console.log('Value is an object with "enabled" property:', value.enabled);
                    // Check if the 'enabled' property is true or false
                    if (value.enabled === true) {
                        console.log('Setting feedback color to green for success.');
                        // Green for success
                        feedback.color = combineRgb(0, 255, 0);
                    } else {
                        console.log('Setting feedback color to red for failure.');
                        // Red for failure
                        feedback.color = combineRgb(255, 0, 0);
                    }
                } else {
                    console.log('Value is not in the expected format. Using default color.');
                    // Default color
                    feedback.color = combineRgb(0, 0, 0);
                }
            },
        },
    });
};
