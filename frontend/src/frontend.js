const domready = require('domready');
const m = require('mithril');

const Title = require('../../shared/src/Title.js');

const App = {
    view: function() {
        return m(Title, 'App');
    }
}

domready(function() {
    const primus = Primus.connect('?token=ZZZ');
    primus.on('open', function() {
        primus.write(JSON.stringify({ action: 'join', world: 'w1' }));
        m.mount(document.body, App);
        primus.on('data', function(data) {
            if (data.query) {
                console.log('QUERY', data);
            }
            else {
                if (data.type === 'WORLD_CHANGED') {
                    primus.write(JSON.stringify({ query: '{ worlds { name } }' }));
                }
            }
        });
    });
});
