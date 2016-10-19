var oAuthMetaClientId = document.createElement("meta"); 
oAuthMetaClientId.setAttribute('name','google-signin-client_id');
oAuthMetaClientId.setAttribute('content',OAUTH_CLIENT_ID);

var $oAuthMetaScope = $('meta[name="google-signin-scope"]');

document.head.insertBefore(oAuthMetaClientId,$oAuthMetaScope[0]);