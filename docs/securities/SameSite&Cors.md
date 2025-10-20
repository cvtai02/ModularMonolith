0. Same Origin Policy is a browser security rule that prevents JS on one origin from reading responses from a different origin.

1. Cookie Samesite kill CSRF
2. Cors relax Same Origin Policy
3. SOP is the restriction, CORS is the exception.


### Cookie-based authentication
**Pros:**
- HttpOnly flag prevents cookie theft via XSS
- SameSite=Strict/Lax prevents CSRF for same-site apps

**Cons:**
- Session-based auth is stateful (server must store sessions)
- Cross-site apps require SameSite=None, which removes CSRF protection → must add CSRF tokens




https://security.stackexchange.com/questions/97825/is-cors-helping-in-anyway-against-cross-site-forgery