/*global chrome*/
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

    async function copyTextToClipboard() {
        // console.log(new_result);
      // new_result = await maintest(); 

       navigator.clipboard.writeText(response).then(() => {
        alert("Copied successfully"); 
          //clipboard successfully set
      }, () => {
          //clipboard write failed, use fallback
      });
  }



  return (
    <Container>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Grid container>
          <Grid item xs={12}>
            {/* <TextField
              fullWidth
              autoFocus
              label="Your text"
              variant="outlined"
              multiline
              rows={4}
              margin="normal"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                chrome.storage.local.set({ prompt: e.target.value });
              }}
            /> */}
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
