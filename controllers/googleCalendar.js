const { google } = require("googleapis");
const ErrorResponse = require("../utils/errorResponse");

exports.addGoogleCalendarEvent = async (req, res, next) => {
  const {
    summary,
    location,
    description,
    eventStartTime,
    eventEndTime,
    timeZone,
    refreshToken,
  } = req.body;

  try {
    if (!refreshToken) {
      return next(new ErrorResponse("field 'refreshToken' is required", 400));
    }

    if (!eventStartTime || !eventEndTime) {
      return next(
        new ErrorResponse(
          "field 'eventStartTime' and 'eventEndTime' is required",
          400
        )
      );
    }

    const { OAuth2 } = google.auth;
    const oAuth2Client = new OAuth2(
      "209403323018-l2svgqktfjuo3lq79gh3540ukke9kn88.apps.googleusercontent.com",
      "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"
    );

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary,
      location,
      description,
      start: {
        dateTime: eventStartTime,
        timeZone,
      },
      end: {
        dateTime: eventEndTime,
        timeZone,
      },
      colorId: 1,
    };

    calendar.freebusy.query(
      {
        resource: {
          timeMin: eventStartTime,
          timeMax: eventEndTime,
          timeZone,
          items: [{ id: "primary" }],
        },
      },
      (err, response) => {
        if (err) {
          return next(new ErrorResponse("Free busy query error", 400));
        }

        const eventsArr = response.data.calendars.primary.busy;

        if (eventsArr.length === 0) {
          return calendar.events.insert(
            { calendarId: "primary", resource: event },
            (error, eventResponse) => {
              if (error) {
                return next(
                  new ErrorResponse("Calendar event creation error", 400)
                );
              }

              res.status(200).json({
                success: true,
                data: `event created ${eventResponse.htmlLink}.`,
              });
            }
          );
        }

        return next(
          new ErrorResponse(
            `User is busy between startTime: ${eventStartTime} and endTime: ${eventEndTime}`,
            400
          )
        );
      }
    );
  } catch (e) {
    res.status(400).json({ success: false });
    console.log(e);
  }
};
