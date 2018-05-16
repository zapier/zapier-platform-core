const legacyScriptingSource = `
    var Zap = {
      contact_full_poll: function(bundle) {
        var response = z.request({
          url: 'https://auth-json-server.zapier.ninja/users',
          params: { api_key: 'secret' }
        });
        var contacts = z.JSON.parse(response.content);
        contacts[0].name = 'Patched by Legacy Scripting!';
        return contacts;
      }
    };
`;

const ContactTrigger_full = {
  key: 'contact_full',
  noun: 'Contact',
  display: {
    label: 'New Contact with Full Scripting'
  },
  operation: {
    perform: {
      source: "return z.legacyScripting.run(bundle, 'trigger', 'contact_full');"
    }
  }
};

const App = {
  title: 'Example App',
  triggers: {
    [ContactTrigger_full.key]: ContactTrigger_full
  },
  legacyScriptingSource
};

module.exports = App;
