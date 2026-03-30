import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import api from "../api/api";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function AupDialog() {
  const [acceptAup] = api.endpoints.acceptAup.useMutation();

  const [open, setOpen] = React.useState(true);

  const handleAccept = async () => {
    try {
      await acceptAup();
    } catch (e) {
      console.error(e);
    }
    setOpen(false);
  };

  return (
    <BootstrapDialog aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Recall.io Acceptable Use Policy
      </DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Welcome to Recall.io, a platform designed to enhance student learning by enabling users to upload notes and
          interact with them via an AI-powered agent. To ensure a safe, lawful, and respectful environment for all
          users, we have established this Acceptable Use Policy ("Policy"). By using our site, you agree to abide by
          this Policy in addition to our Terms of Service and Privacy Policy.
        </Typography>
        <Typography gutterBottom>
          <strong>1. Acceptable Use</strong>
          <br />
          You may use Recall.io only for lawful purposes and in ways that do not infringe on the rights of others.
          Acceptable use includes, but is not limited to:
          <ul>
            <li>Uploading class notes, personal study guides, and other original materials.</li>
            <li>Using the AI agent to interact with and analyze your own uploaded content.</li>
            <li>Respecting the intellectual property rights of others.</li>
          </ul>
        </Typography>
        <Typography gutterBottom>
          <strong>2. Prohibited Conduct</strong>
          <br />
          The following activities are strictly prohibited on Recall.io:
          <br />
          <br />
          2.1 Content-Related Restrictions
          <br />
          <ul>
            <li>
              Copyright Infringement: Uploading materials protected by copyright that you do not have permission to
              share, including but not limited to textbooks, articles, or other proprietary content.
            </li>
            <li>
              Plagiarism: Uploading or sharing materials that you did not create or do not have explicit permission to
              use.
            </li>
            <li>
              Harmful Content: Uploading content that is illegal, abusive, defamatory, obscene, hateful, or otherwise
              inappropriate.
            </li>
          </ul>
          2.2 Platform Misuse AI Abuse
          <br />
          <ul>
            <li>Using the AI agent to generate or distribute inappropriate, harmful, or misleading content.</li>
            <li>
              Security Violations: Attempting to bypass security measures, introduce malware, or disrupt the normal
              operation of the platform.
            </li>
            <li>Unauthorized Access: Using someone else's account or impersonating another individual.</li>
          </ul>
        </Typography>
        <Typography gutterBottom>
          <strong>3. Copyright and Intellectual Property</strong>
          <br />
          Users are solely responsible for ensuring that the content they upload complies with all applicable copyright
          laws. Recall.io does not claim ownership of uploaded materials but reserves the right to remove any content
          flagged for copyright violations. Repeat offenders may have their accounts suspended or terminated.
        </Typography>
        <Typography gutterBottom>
          <strong>4. Enforcement and Penalties</strong>
          <br />
          Violation of this Policy may result in actions including, but not limited to: content removal, account
          suspension or termination, and reporting violations to law enforcement or educational institutions, if
          applicable.
          <br />
          We reserve the right to monitor and investigate any activity on Recall.io to ensure compliance with this
          Policy.
        </Typography>
        <Typography gutterBottom>
          <strong>5. Reporting Misuse</strong>
          <br />
          If you encounter content or behavior that violates this Policy, please report it immediately. We take all
          reports seriously and will act promptly to address concerns.
        </Typography>
        <Typography gutterBottom>
          <strong>6. Amendments to This Policy</strong>
          <br />
          Recall.io reserves the right to update or modify this Policy at any time. Changes will take effect immediately
          upon being posted on this page, and your continued use of the site indicates acceptance of the updated Policy.
        </Typography>
        <hr />
        <Typography gutterBottom>
          By using Recall.io, you acknowledge that you have read, understood, and agreed to this Acceptable Use Policy.
          Thank you for helping us maintain a productive and respectful learning environment!
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus variant="contained" onClick={handleAccept}>
          Accept
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
}
