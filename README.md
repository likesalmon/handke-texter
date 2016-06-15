Handke Texter
=============
A Tech-op friendly web application to send and receive
audience texts during performances of Liminal's
Offending the Audience.


Development
===========

Startup
-------
Start the API form the handke-texter directory with:

    npm start

This will initialize the app and load the default
user into the database.

[forever](https://github.com/foreverjs/forever)
will keep the app running in the background until
you stop it.

View running forever processes with:

    forever list

The list of processes will contain a uid, which
can be used to control to the process.

Stop the server with:

    forever stop [uid]

Example:

    forever stop Jb_m

Restart the server with:

    forever restart [uid]

Example:

    forever restart Jb_m

`forever list` will also print the location of the
log file for the process. You can view a log with:

    tail -f [/path/to/log]

Example:

    tail -f /Users/likesalmon/.forever/Jb_m.log


Run ngrok
---------
Next a separate terminal window start ngrok, which
will create a secure tunnel from your localhost to
the internets:

    npm run ngrok

When you start ngrok, it will give you a forwarding url
that you can use in your twilio configuration:

    Forwarding http://d331b99b.ngrok.io -> localhost:8000

Configure twilio
----------------
Finally, configure twilio to use your ngrok forwarding url.
This must be done every time you start ngrok, because
your forwarding url changes.

Log on to twilio and go to
(Voice, SMS & MMS > Phone Numbers)[https://www.twilio.com/user/account/voice-sms-mms/phone-numbers],
then click on your phone number. In the SMS & MMS tab,
paste the ngrok forwarding url in the Request URL input
and append the endpoint (`/api/sms/incoming`). For example:

    http://d331b99b.ngrok.io/api/sms/incoming

Click `save`.

Now when you text your twilio number a GET
request will be forwarded to your API, which will emit
a Socket.io event that the UI is listening for.






Production
==========

Startup
-------
Startup in production takes two steps: initializing the
app and configuring twilio to use the correct endpoint.

Start the API from the `handke-texter` directory with:

    npm run production

Configure twilio
----------------
Log on to twilio and go to
[Voice, SMS & MMS > Phone Numbers](https://www.twilio.com/user/account/voice-sms-mms/phone-numbers),
then click on your phone number.

In the SMS & MMS tab, paste the endpoint into the
Request URL input. For example:

    http://handke.likesalmon.net/api/sms/incoming

Click save.

Now when your twilio number receives a text, a request
will be made to the `/api/sms/incoming` endpoint, which
will in turn emit a Socket.io event that the UI is
listening for.
