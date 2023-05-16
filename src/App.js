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
import { Box, Button, Container, Grid, Paper, TextField, colors } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { Configuration, OpenAIApi } from "openai";
import { Margin } from "@mui/icons-material";
import { Link } from "react-router";


var type = 0;

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  // api set-up 
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  delete configuration.baseOptions.headers['User-Agent'];
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

  // bracket remover 
  async function bracketCLeaner(text) {
    let result = '';
    let buf = [];

    for (let i = 0; i < text.length; i++) {
      if (text[i] === '(' || text[i] === '[' || text[i] === '{') {
        buf.push(i);
      } else if (text[i] === ')' || text[i] === ']' || text[i] === '}') {
        if (buf.length > 0) {
          let start = buf.pop();
          let end = i;
          result += text.slice(start + 1, end);
        }
      } else {
        if (buf.length === 0) {
          result += text[i];
        }
      }
    }
    return result;
  }


  // OpenAI creater/handler 
  async function handleSubmit(t) {
    type = t;
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

    if (result.length > 0) {
       result = result.replace("/\s+/g", ' ');
    }

    if (type == 0) { // code open 
      result = "generate a 8 to 12 sentence message encouraging a person to chat about Rodeo Money. \
      Begin the message by acknowledging their position and company if provided. \
      Then ask questions about their difficulties with affiliate management. \
      Eventually, introduce 'Rodeo' and schedule a talk. Do not say 'or not'.";
    }
    else if (type == 2) { // reply based on selection 
      result = "make a follow-up reply to the following: " + result;
    }
    else if (result == "" || type == 1) { // create a follow-up message 
      result = "create a simple and nice and 4 sentence message asking for an \
      update if they will be using Rodeo, do not explain what Rodeo is, do \
      not say 'or not' or include brackets to fill in details.";
    }
    else { // create a follow-up message based on selection 
      result = "make a follow-up reply to the following: " + result;
    }

    // prompt structure 
    let convo = [
      {
        role: "system",
        content: "You are a virtual assistant for the company called 'Rodeo'. 'Rodeo' is an Ai Assistant that streamlines the management of affiliates."
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
      setResponse((completion.data.choices[0].message?.content));
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
              disableElevation
              variant="contained"
              onClick={() => handleSubmit(0)}
              style={{
                backgroundColor: "white",
                color: "black",
                margin: 5
              }}
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
              Cold Open
            </Button>

            <Button
              disableElevation
              variant="contained"
              onClick={() => handleSubmit(1)}
              style={{
                backgroundColor: "white",
                color: "black",
                margin: 5
              }}
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
              Follow-UP
            </Button>
            <Button
              disableElevation
              variant="contained"
              onClick={() => handleSubmit(2)}
              style={{
                backgroundColor: "white",
                color: "black",
                margin: 5
              }}
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
              Reply
            </Button>

          </Grid>
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Paper
              sx={{ p: 3 }}>{response}
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ mt: 3 }}>

          <Button
            disableElevation
            variant="contained"
            onClick={() => copyTextToClipboard()}
            style={{
              backgroundColor: "white",
              color: "black",
              margin: 5
            }}
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
          <Button
            variant="contained"
            onClick={() => handleSubmit(type)}
            style={{
              backgroundColor: "white",
              color: "black",
              margin: 5
            }}
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
            reload
          </Button>
        </Grid>

      </Box>
      <Grid item xs={12} sx={{ mt: 3 }}>

        <a href="https://rodeo-usf.vercel.app/" target="_blank" rel="noreferrer">
          <img
            src="bull_icon.png"
            alt="new"
            class="center"
            width="64"
            height="64"
          />
        </a>


      </Grid>
      <Grid item xs={12} sx={{ mt: 3 }}>
      </Grid>


    </Container>
  );
}

export default App;
