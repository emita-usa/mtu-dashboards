module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define("user", {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING
        },
        last_name: {
            type: DataTypes.STRING
        }
    });

    return User;
};

/*
{ sub: 't71xpKduIkQYuYaECGkYHaCkhdj-ePjx-FZMPElFaYY',
  oid: '15627e43-b4d2-4cf7-a42e-6b4166e000f5',
  upn: undefined,
  displayName: 'Jonathan Creasy',
  name: { familyName: 'Creasy', givenName: 'Jonathan' },
  emails: 'jcreasy@ofallon.org',
  _raw: '{"aud":"b6290e40-f20f-4fd4-adf6-e11d7a5dc32c","iss":"https://login.microsoftonline.com/619fa94c-bf77-4584-b8e1-4c217799d1a3/v2.0","iat":1536711509,"nbf":1536711509,"exp":1536715409,"aio":"ATQAy/8IAAAAT1ZoQJu9haOxCMlMJgQjHmgKwDlt/W9YV2WM8VtG8JIR5y2PJbezIqO1nVAJt7EV","name":"Jonathan Creasy","nonce":"8MCxLouRbDwDz3x1ZnU1-RgwQufNJe9d","oid":"15627e43-b4d2-4cf7-a42e-6b4166e000f5","preferred_username":"jcreasy@ofallon.org","sub":"t71xpKduIkQYuYaECGkYHaCkhdj-ePjx-FZMPElFaYY","tid":"619fa94c-bf77-4584-b8e1-4c217799d1a3","uti":"g7P_9sVsmUWxhuW6nRABAA","ver":"2.0"}',
  _json:
   { aud: 'b6290e40-f20f-4fd4-adf6-e11d7a5dc32c',
     iss: 'https://login.microsoftonline.com/619fa94c-bf77-4584-b8e1-4c217799d1a3/v2.0',
     iat: 1536711509,
     nbf: 1536711509,
     exp: 1536715409,
     aio: 'ATQAy/8IAAAAT1ZoQJu9haOxCMlMJgQjHmgKwDlt/W9YV2WM8VtG8JIR5y2PJbezIqO1nVAJt7EV',
     name: 'Jonathan Creasy',
     nonce: '8MCxLouRbDwDz3x1ZnU1-RgwQufNJe9d',
     oid: '15627e43-b4d2-4cf7-a42e-6b4166e000f5',
     preferred_username: 'jcreasy@ofallon.org',
     sub: 't71xpKduIkQYuYaECGkYHaCkhdj-ePjx-FZMPElFaYY',
     tid: '619fa94c-bf77-4584-b8e1-4c217799d1a3',
     uti: 'g7P_9sVsmUWxhuW6nRABAA',
     ver: '2.0' },
  mobilePhone: null,
  officeLocation: 'Fire',
  preferredLanguage: null,
  businessPhones: [ '618-624-4515' ],
  jobTitle: 'Paid-on-Call Firefighter' }
 */