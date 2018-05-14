const domready = require('domready');
const m = require('mithril');

const Title = require('../../shared/src/Title.js');

const state = {

};

domready(function() {
    const primus = Primus.connect('?world=W1&token=ZZZ');

    const createContorButton = m('Button', {
        onclick: function() {
            primus.write(JSON.stringify({ action: 'placeContor', payload: { city: 'Hamburg' } }));
        }
    }, 'create contor');

    const App = {
        view: function() {
            return [
                m(Title, 'App'),
                !state.contors || !state.contors.length ? createContorButton: ''
            ];
        }
    }

    let initialConnect = false;

    primus.on('open', function() {
        primus.write(JSON.stringify({ action: 'join' }));

        if (initialConnect) {
            return;
        }

        primus.write(JSON.stringify({ query: '{ worlds { name } }' }));
        primus.write(JSON.stringify({ query: '{ cities { name } }' }));
        primus.write(JSON.stringify({ query: '{ contors { city } }' }));

        m.mount(document.body, App);
        primus.on('data', function(data) {
            if (data.query) {
                if (data.query === '{ contors { city } }') {
                    state.contors = data.result.contors;
                    m.redraw();
                }
            }
            else {
                if (data.type === 'WORLD_CHANGED') {
                    primus.write(JSON.stringify({ query: '{ worlds { name } }' }));
                    primus.write(JSON.stringify({ query: '{ cities { name } }' }));
                }
                else if (data.type === 'PROFILE_CHANGED') {
                    primus.write(JSON.stringify({ query: '{ profile { username } }' }));
                }
                else if (data.type === 'CONTORS_CHANGED') {
                    primus.write(JSON.stringify({ query: '{ contors { city } }' }));
                }
            }
        });

        initialConnect = true;
    });
});
