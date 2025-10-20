1. event bus: MediatR -> RabbitMQ
2. 1 db for all module -> n db for m modules -> query command dbs
3. For api identity: If using cookies, must use cookies samesite or CSRF token. I dont like CSRF token pattern, and SameSite makes OIDC migration harder. so just use JWT bearer for ASPNET CORE IDENTITY.