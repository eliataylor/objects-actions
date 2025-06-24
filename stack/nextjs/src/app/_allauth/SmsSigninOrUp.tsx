import React, { useState } from "react";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { sms, smsVerify } from "./lib/allauth";
import { Link } from "react-router-dom";
import { makeRelative } from "../utils";

interface SmsSigninOrUpProps {
  onVerify?: (phoneNumber: string) => void;
}

const SmsSigninOrUp: React.FC<SmsSigninOrUpProps> = ({ onVerify }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [response, setResponse] = useState({ fetching: false, content: null });
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPhoneNumber(event.target.value);
  };

  const handleVerificationCodeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(event.target.value);
  };

  const handleSendCode = async () => {
    if (validatePhoneNumber(phoneNumber)) {
      setError("");
      try {
        await sendSms(phoneNumber);
        setIsCodeSent(true);
      } catch (err) {
        console.error(err);
        setError("Failed to send SMS. Please try again.");
      }
    } else {
      setError("Invalid phone number format");
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode && verificationCode.length > 0) {
      setError("");
      try {
        await SmsSigninOrUpCode(phoneNumber, verificationCode);
        // onVerify(phoneNumber);
      } catch (err) {
        console.error(err);
        setError("Verification failed. Please try again.");
      }
    }
  };

  const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  const sendSms = async (phoneNumber: string) => {
    setResponse({ ...response, fetching: true });
    sms({ phone: phoneNumber })
      .then((content) => {
        setResponse((r) => {
          return { ...r, content };
        });
      })
      .catch((e) => {
        console.error(e);
        window.alert(e);
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  };

  const SmsSigninOrUpCode = async (phoneNumber: string, code: string) => {
    setResponse({ ...response, fetching: true });
    smsVerify({ phone: phoneNumber, code: code })
      .then((content) => {
        if (content && content.id) {
          if (content.redirect) {
            document.location.href = makeRelative(content.redirect);
          } else {
            document.location.href = "/";
          }
        } else {
          setError(`Invalid Code ${JSON.stringify(content)}`);
        }
      })
      .catch((e) => {
        console.error(e);
        window.alert(e);
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  };

  return (
    <Grid
      container
      flexDirection="column"
      justifyContent={"space-between"}
      pb={3}
    >
      <Grid item style={{ alignSelf: "flex-start" }}></Grid>
      {!isCodeSent ? (
        <React.Fragment>
          <Grid item>
            <TextField
              label="Your phone number"
              variant="standard"
              fullWidth
              margin="normal"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              error={!error}
              helperText={error}
            />
          </Grid>
          <Grid item xs={12} style={{ textAlign: "center" }} mb={5}>
            <Button
              disabled={
                response.fetching || phoneNumber.length < "4159999999".length
              }
              fullWidth={true}
              variant="contained"
              color="primary"
              onClick={handleSendCode}
            >
              Send Code
            </Button>
          </Grid>
          <Link to={`/account/login`}>Other signin options</Link>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Grid item>
            <Typography variant="h5">Verify your phone</Typography>
            <Typography variant="body2" gutterBottom>
              Enter the code sent to your phone number
            </Typography>
            <TextField
              label="Verification Code"
              variant="filled"
              fullWidth
              margin="normal"
              placeholder={"000000"}
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              error={!error}
              helperText={error}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth={true}
              disabled={response.fetching}
              variant="contained"
              color="primary"
              onClick={handleVerifyCode}
            >
              Next
            </Button>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  );
};

export default SmsSigninOrUp;
