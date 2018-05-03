const Lab = require('lab');
const lab = exports.lab = Lab.script();
const ProcessPlugin = require('../../src/plugins/process.js');

lab.experiment('', () => {

    lab.test('should work', (done) => {

        ProcessPlugin.register({
            decorate: function (type, name, value) {

                Lab.expect(type).to.equal('server');
            }
        }, {}, done);
    });
});
