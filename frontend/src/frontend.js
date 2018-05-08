const domready = require('domready');
const m = require('mithril');

const Title = require('../../shared/src/Title.js');

const App = {
    view: function() {
        return m(Title, 'App');
    }
}

let initialConnect = false;

domready(function() {
    const primus = Primus.connect('?world=W1&token=ZZZ');
    primus.on('open', function() {
        primus.write(JSON.stringify({ action: 'join' }));

        if (initialConnect) {
            return;
        }

        primus.write(JSON.stringify({ query: '{ worlds { name } }' }));

        m.mount(document.body, App);
        primus.on('data', function(data) {
            if (data.query) {
                console.log('QUERY', data);
            }
            else {
                if (data.type === 'WORLD_CHANGED') {
                    primus.write(JSON.stringify({ query: '{ worlds { name } }' }));
                }
                else if (data.type === 'PROFILE_CHANGED') {
                    primus.write(JSON.stringify({ query: '{ profile { username } }' }));
                }
            }
        });

        initialConnect = true;
    });
});
