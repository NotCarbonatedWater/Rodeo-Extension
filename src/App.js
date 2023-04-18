/*global chrome*/

/**
 * Version: 0.1.2
 * 
 * This version serves as a rough demo and plan for this project 
 * 
 * Working in this demo: 
 *   Creating a follow-up message by selecting text (optional, if not, will create 
 *   a basic follow-up reply), selecting the rodeo icon on extension bar, clicking 
 *   submit will send message through follow-up function, then show message after 
 *   processing, allowing user to copying to clipboard with the "copy button"
 */

import React, { useEffect, useState } from "react";
import "./App.css";
import { Box, Button, Container, Grid, Paper, TextField } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { Configuration, OpenAIApi } from "openai";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  // prompt handler 
  useEffect(() => {
    try {
      chrome.storage.local.get(null, function (data) {
        if ("prompt" in data) {
          setPrompt(data.prompt);
        }
      });
    } catch (e) {
      console.log("Error due to local state");
    }
  }, []);

  // OpenAI creater/handler 
  async function handleSubmit() {
    setIsLoading(true);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let result;
    try {
      [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => getSelection().toString(),
      });
    } catch (e) {
      return; // ignoring an unsupported page like chrome://extensions
    }
    if (result == "") {
      result = "create a simple and nice and 4 sentence message asking for an \
      update if they will be using Rodeo, do not explain what Rodeo is, do \
      not say 'or not'.";
    }
    else {
      result = "make a follow-up reply to the following: " + result;
    }
    // prompt structure for "Follow-Up"
    let convo = [
      {
        role: "system",
        content: "You are a virtual assistant for the company called 'Rodeo'."
      },
      {
        role: "user",
        content: result
      }
    ]

    // OpenAI call
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: convo
      });
      setResponse(completion.data.choices[0].message?.content);
      setIsLoading(false);
    } catch (e) {
      alert("Error: ", e);
      setIsLoading(false);
    }
  }

  // copy to clipboard 
  async function copyTextToClipboard() {
    navigator.clipboard.writeText(response).then(() => {
      alert("Copied Successfully");
    }, () => {
      alert("Copy to Clipboard Failed");
    });
  }


  return (
    <Container>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Grid container>
          <Grid item xs={12}>
            <Button
              fullWidth
              disableElevation
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={isLoading}
              startIcon={
                isLoading && (
                  <AutorenewIcon
                    sx={{
                      animation: "spin 2s linear infinite",
                      "@keyframes spin": {
                        "0%": {
                          transform: "rotate(360deg)",
                        },
                        "100%": {
                          transform: "rotate(0deg)",
                        },
                      },
                    }}
                  />
                )
              }
            >
              Submit
            </Button>

          </Grid>
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Paper sx={{ p: 3 }}>{response}</Paper>
          </Grid>
        </Grid>
        <Button
          disableElevation
          variant="contained"
          onClick={() => copyTextToClipboard()}
          disabled={isLoading || response.length == 0}
          startIcon={
            isLoading && (
              <AutorenewIcon
                sx={{
                  animation: "spin 2s linear infinite",
                  "@keyframes spin": {
                    "0%": {
                      transform: "rotate(360deg)",
                    },
                    "100%": {
                      transform: "rotate(0deg)",
                    },
                  },
                }}
              />
            )
          }
        >
          copy
        </Button>
      </Box>
    </Container>
  );
}

export default App;
