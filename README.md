# wso2-iam-sample-app-test-niluka
This repository is used to maintain sample applications for testing purpose 

Configurations
WSO2 Identity Server

Navigate to Main (Tab) -> Identity (Section) -> Service Providers (Sub-section) and select Add. The management console,

Add a new service provider.
Provide …
Service Provider Name: SampleExpressApp
Description: Any valid description of the service provider

And click Register to register and create a new service provider. 

Expand the Claim Configurations (accordion) to configure wanted claims and subject claim URI. 

For the example, we can select the following claims
http://wso2.org/claims/emailaddress
http://wso2.org/claims/username
http://wso2.org/claims/role
And choose http://wso2.org/claims/emailaddress as the Subject Claim URI.

Next, expand the Inbound Authentication Configuration (accordion) and click on SAML2 Web SSO Configuration and select Configure to configure SAML web SSO for our implemented express application.

Configure the SAML SSO as follows …
Issuer: SampleExpressApp
Assertion Consumer URLs: http://localhost:3000/saml/consume
Enable Response Signing: True
Enable Signature Validation in Authentication Requests and Logout Requests: False
Enable Single Logout: True
SLO Response URL: http://localhost:3000/app/home
SLO Request URL: http://localhost:3000/app/home
Enable Attribute Profile: True
Include Attributes in the Response Always: True

Click on Update.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Express Application

Create a .env file in the root path and enter the following properties.

Change the SAML_ENTRYPOINT and SAML_LOGOUTURL properties if the IP-address and ports are different from default configurations
SESSION_SECRET="a well secured secret"

SAML_ENTRYPOINT="https://localhost:9443/samlsso"
SAML_ISSUER="SampleExpressApp"
SAML_PROTOCOL="http://"
SAML_LOGOUTURL="https://localhost:9443/samlsso"

WSO2_ROLE_CLAIM="http://wso2.org/claims/role"
WSO2_EMAIL_CLAIM="http://wso2.org/claims/emailaddress"

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Run & Test

Run the express application by executing the given command from the root folder
```
npm start
```

Also, start your WSO2 Identity Server instance using the following command from your <IS_HOME>/bin directory
```
sh wso2server.sh
```

Open your favorite browser and navigate to http://localhost:3000/app.

Navigate to http://localhost:3000/app/logout to log-out from the SAML SSO session.



