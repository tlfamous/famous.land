-- The previous five-attempt threshold was too aggressive for the shared admin password.
-- Clear any lockouts created under that retired policy; future lockouts happen only after 100 failures.
update admin_login_attempts
set blocked_until = null
where blocked_until is not null;
