"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Grid,
  Container,
  Paper,
  Fade,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  SmartToy as ModelIcon,
  Edit as EditIcon,
} from "@mui/icons-material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useAppDispatch, useAppSelector } from 'src/app/lib/hooks';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomModal from 'src/components/modal/modal';
import { useSnackbar } from 'src/components/snackbar';
import {
  LOADING_SCREEN_STYLES,
} from 'src/utils/constants';
import { ValidateAIKey } from 'src/utils/helpers';
import { DeleteOpenAIModel, SaveOpenAIModel, GetOpenAIModels, UpdateOpenAIModel, ResetOpenAIModelNotify, SetOpenAIModelState } from "src/app/lib/slices/open-ai-model-slice"


// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#0F766E",
      light: "#14B8A6",
      dark: "#134E4A",
    },
    secondary: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F2937",
      secondary: "#6B7280",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
})

const GPTModelsManager = () => {
  const {
    deleteModelLoading,
    getOpenAIModelsLoading,
    saveNewModelLoading,
    updateModelLoading,
    openAIModelsList,
    notifyMessage: openAINotifyMessage,
    notifyType: openAINotifyType,
    notify: openAINotify,
    modelAdded,
  } = useAppSelector((state) => state.openAIModel);

  const [isAdding, setIsAdding] = useState(false)
  const [newModelName, setNewModelName] = useState("")
  const [newApiKey, setNewApiKey] = useState("")
  const [errors, setErrors] = useState({ modelName: "", apiKey: "", editApiKey: "" })

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editApiKey, setEditApiKey] = useState("") // fixed init

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const handleAddModel = () => {
    setIsAdding(true)
    setNewModelName("")
    setNewApiKey("")
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewModelName("")
    setNewApiKey("")
    setErrors((prev) => ({ ...prev, apiKey: "", modelName: "" }))
  }

  const handleMakeDefault = async (modelId) => {
    try {
      dispatch(
        UpdateOpenAIModel({
          _id: modelId,
          updateParams: { isDefault: true }
        })
      );
    } catch (err) {
      console.error("Failed to update default model:", err);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSaveModel()
    } else if (event.key === "Escape") {
      handleCancelAdd()
    }
  }

  const handleEditModel = (model) => {
    setEditingModel(model)
    setEditApiKey("")
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingModel(null)
    setEditApiKey("")
    setErrors((prev) => ({ ...prev, editApiKey: "" }))
  }

  const handleSaveApiKey = async () => {
    const trimmedKey = editApiKey.trim();
    if (!trimmedKey) return;

    const validation = await ValidateAIKey({ aIKey: trimmedKey, modelName: editingModel?.modelName });
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, editApiKey: validation.message }));
      return;
    }

    try {
      dispatch(
        UpdateOpenAIModel({
          _id: editingModel._id,
          updateParams: { apiKey: trimmedKey }
        })
      );

      setErrors((prev) => ({ ...prev, editApiKey: "" }));
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update API key:", err);
    }
  };

  const handleSaveModel = async () => {
    const trimmedName = newModelName.trim();
    const trimmedKey = newApiKey.trim();

    if (!trimmedName || !trimmedKey) return;

    const validation = await ValidateAIKey({ aIKey: trimmedKey, modelName: trimmedName });
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, apiKey: validation.message }));
      return;
    }

    try {
      dispatch(
        SaveOpenAIModel({
          modelName: trimmedName,
          apiKey: trimmedKey,
        })
      );
    } catch (error) {
      console.error("Failed to save model:", error);
    }
  };

  const handleDeleteModel = (model) => {
    setDeleteModal(model)
    setDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (deleteModal) {
      try {
        dispatch(DeleteOpenAIModel({ _id: deleteModal._id }))
        setDeleteModal(null);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete model:", error);
      }
    }
  };

  useEffect(() => {
    dispatch(GetOpenAIModels());
  }, []);

  useEffect(() => {
    if (openAINotify && openAINotifyMessage) {
      enqueueSnackbar(openAINotifyMessage, { variant: openAINotifyType });
      dispatch(ResetOpenAIModelNotify());
    }
  }, [openAINotify, openAINotifyMessage, openAINotifyType]);

  useEffect(() => {
    if (modelAdded) {
      setNewModelName("");
      setNewApiKey("");
      setIsAdding(false);
      setErrors({ modelName: "", apiKey: "", editApiKey: "" });
      dispatch(SetOpenAIModelState({ field: 'modelAdded', value: false }));
    }
  }, [modelAdded, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
            OpenAI GPT Models
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage your OpenAI GPT model configurations
          </Typography>
          <Paper
            elevation={0}
            sx={{ p: 3, mb: 4, backgroundColor: "background.paper", border: "1px solid #E5E7EB" }}
          >
            {updateModelLoading || getOpenAIModelsLoading ? (
              <LoadingScreen sx={{ ...LOADING_SCREEN_STYLES }} />
            ) : (
              <>
                {!isAdding && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddModel}
                    size="large"
                    sx={{ px: 3, py: 1.5 }}
                  >
                    Add Model
                  </Button>
                )}

                {isAdding && (
                  <Fade in={isAdding}>
                    <Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                        <TextField
                          label="Model Name"
                          placeholder="e.g., gpt-4o, gpt-3.5-turbo-16k"
                          value={newModelName}
                          onChange={(e) => setNewModelName(e.target.value)}
                          onKeyDown={handleKeyPress}
                          autoFocus
                          size="medium"
                          error={
                            newModelName.trim() &&
                            openAIModelsList.some((model) => model.modelName === newModelName.trim())
                          }
                          helperText={
                            newModelName.trim() &&
                              openAIModelsList.some((model) => model.modelName === newModelName.trim())
                              ? "This model already exists"
                              : ""
                          }
                        />
                        <TextField
                          label="API Key"
                          placeholder="Enter your OpenAI API key"
                          value={newApiKey}
                          onChange={(e) => {
                            setNewApiKey(e.target.value)
                            setErrors((prev) => ({ ...prev, apiKey: "" }))
                          }}
                          autoComplete="off"
                          onKeyDown={handleKeyPress}
                          size="medium"
                          error={Boolean(errors.apiKey)}
                          helperText={errors.apiKey || ""}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelAdd}
                          color="inherit"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveModel}
                          disabled={
                            !newModelName.trim() ||
                            openAIModelsList.some((model) => model.modelName === newModelName.trim()) ||
                            !newApiKey.trim() ||
                            saveNewModelLoading
                          }
                        >
                          {saveNewModelLoading ? "Saving..." : "Save Model"}
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </>
            )}
          </Paper>
        </Box>

        {/* Models Grid */}
        <Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, display: "flex", alignItems: "center", gap: 1 }}>
            <ModelIcon color="primary" />
            Available Models ({openAIModelsList.length})
          </Typography>

          {openAIModelsList.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: "center", backgroundColor: "background.paper", border: "1px solid #E5E7EB" }}>
              <ModelIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No models configured
              </Typography>
              <Typography variant="body2" color="text.secondary">
               Click &quot;Add Model&quot; to get started with your first GPT model.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {openAIModelsList.map((model) => (
                <Grid item xs={12} sm={6} md={4} key={model.modelName}>
                  <Card
                    sx={{
                      height: "100%",
                      position: "relative",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": { transform: "translateY(-2px)" },
                      ...(model.isDefault && { border: "2px solid #0F766E" }),
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 500, color: "text.primary", wordBreak: "break-word", lineHeight: 1.3 }}>
                            {model.modelName || ''}
                          </Typography>
                          {model.isDefault && (
                            <Chip label="Default" size="small" color="primary" sx={{ fontWeight: 500, ml: 1 }} />
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton onClick={() => handleEditModel(model)} size="small" sx={{ color: "primary.main", "&:hover": { backgroundColor: "primary.light", color: "white" } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <Tooltip
                            title={model.isDefault ? "You cannot delete the default model" : ""}
                          >
                            <span>
                              <IconButton
                                onClick={() => handleDeleteModel(model)}
                                size="small"
                                sx={{
                                  color: model.isDefault ? "grey.400" : "error.main",
                                  "&:hover": model.isDefault
                                    ? {}
                                    : { backgroundColor: "error.light", color: "white" },
                                }}
                                disabled={model.isDefault}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        **** **** {model.last4Digits}
                      </Typography>

                      {!model.isDefault && (
                        <Button variant="outlined" size="small" onClick={() => handleMakeDefault(model._id)} sx={{ mt: 2 }}>
                          Make Default
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Model: {editingModel?.modelName}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                label="New API Key"
                value={editApiKey}
                onChange={(e) => {
                  setEditApiKey(e.target.value)
                  setErrors((prev) => ({ ...prev, editApiKey: "" }))
                }}
                type="text"
                fullWidth
                autoComplete="off"
                size="medium"
                placeholder="Enter new API key"
                error={Boolean(errors.editApiKey)}
                helperText={errors.editApiKey || ""}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mb: 2 }}>
              <Button variant="outlined" onClick={handleCloseEditModal} startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveApiKey}
                startIcon={<SaveIcon />}
                disabled={!editApiKey || !editApiKey.trim()}
              >
                Save
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Delete Modal */}
        <CustomModal
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => handleDeleteConfirm()}
          title="Delete Model"
          actions={
            <>
              <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                Cancel
              </Button>
              <Button onClick={() => handleDeleteConfirm()} variant="contained" color="error">
                Delete
              </Button>
            </>
          }
        >
          {deleteModelLoading ? <LoadingScreen sx={{ ...LOADING_SCREEN_STYLES }} /> : null}
          <p>Are you sure you want to delete this model? This action cannot be undone.</p>
        </CustomModal>
      </Container>
    </ThemeProvider>
  )
}

export default GPTModelsManager
