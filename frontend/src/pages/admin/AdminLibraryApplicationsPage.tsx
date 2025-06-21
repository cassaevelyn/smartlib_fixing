import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { adminService } from '../../services/adminService';
import { UserLibraryAccess } from '../../types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  MenuItem,
  Grid,
  Tabs,
  Tab,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import {
  Search,
  CheckCircle,
  Cancel,
  Person,
  LocalLibrary,
  Visibility,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import { formatDate } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`applications-tabpanel-${index}`}
      aria-labelledby={`applications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export function AdminLibraryApplicationsPage() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  
  const [applications, setApplications] = useState<UserLibraryAccess[]>([])
  const [selectedApplication, setSelectedApplication] = useState<UserLibraryAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tabValue, setTabValue] = useState(0)
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    if (!user?.managed_library_id) {
      setError("You don't have a managed library assigned to your account.")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await adminService.getUserLibraryAccess()
      
      // Filter applications for the admin's managed library
      const filteredApplications = response.results.filter(
        app => app.library === user.managed_library_id
      )
      
      setApplications(filteredApplications)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch library applications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveApplication = async () => {
    if (!selectedApplication) return
    
    try {
      setIsProcessing(true)
      
      await adminService.approveLibraryAccess(selectedApplication.id)
      
      toast({
        title: "Application Approved",
        description: `Library access for ${selectedApplication.user_display} has been approved.`,
        variant: "default",
      })
      
      setApproveDialogOpen(false)
      fetchApplications() // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to approve application',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectApplication = async () => {
    if (!selectedApplication) return
    
    try {
      setIsProcessing(true)
      
      await adminService.rejectLibraryAccess(selectedApplication.id, rejectionReason)
      
      toast({
        title: "Application Rejected",
        description: `Library access for ${selectedApplication.user_display} has been rejected.`,
        variant: "default",
      })
      
      setRejectDialogOpen(false)
      setRejectionReason('') // Reset the rejection reason
      fetchApplications() // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to reject application',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const filteredApplications = applications.filter(application => {
    const matchesSearch = searchQuery === '' || 
      application.user_display.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = tabValue === 0 ? 
      !application.is_active : // Pending
      application.is_active    // Approved
    
    return matchesSearch && matchesTab
  })

  const columns: GridColDef[] = [
    {
      field: 'user_display',
      headerName: 'User',
      flex: 1,
      renderCell: (params: GridRenderCellParams<UserLibraryAccess>) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Person sx={{ mr: 1 }} />
          <Typography variant="body2">
            {params.row.user_display}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'access_type_display',
      headerName: 'Access Type',
      width: 150,
    },
    {
      field: 'created_at',
      headerName: 'Applied On',
      width: 150,
      valueFormatter: (params) => formatDate(params.value as string),
    },
    {
      field: 'granted_at',
      headerName: 'Granted On',
      width: 150,
      valueFormatter: (params) => params.value ? formatDate(params.value as string) : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams<UserLibraryAccess>) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedApplication(params.row)
                setViewDialogOpen(true)
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {!params.row.is_active && (
            <Tooltip title="Approve Application">
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setSelectedApplication(params.row)
                  setApproveDialogOpen(true)
                }}
              >
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {!params.row.is_active && (
            <Tooltip title="Reject Application">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedApplication(params.row)
                  setRejectDialogOpen(true)
                }}
              >
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {params.row.is_active && (
            <Tooltip title="Revoke Access">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedApplication(params.row)
                  setRejectDialogOpen(true)
                }}
              >
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ]

  if (!user?.managed_library_id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You don't have a managed library assigned to your account. Please contact a super admin.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Library Access Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user applications for access to your library.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="application tabs"
              >
                <Tab label="Pending" />
                <Tab label="Approved" />
              </Tabs>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by user name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ height: 600, width: '100%' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <LoadingSpinner size="lg" />
                </Box>
              ) : (
                <TabPanel value={tabValue} index={tabValue}>
                  {filteredApplications.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      {tabValue === 0 
                        ? "No pending applications found." 
                        : "No approved applications found."}
                    </Alert>
                  ) : (
                    <DataGrid
                      rows={filteredApplications}
                      columns={columns}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 10 },
                        },
                        sorting: {
                          sortModel: [{ field: 'created_at', sort: 'desc' }],
                        },
                      }}
                      pageSizeOptions={[10, 25, 50]}
                      checkboxSelection
                      disableRowSelectionOnClick
                      components={{
                        Toolbar: GridToolbar,
                      }}
                    />
                  )}
                </TabPanel>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* View Application Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Application Details</DialogTitle>
          <DialogContent dividers>
            {selectedApplication && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    User Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.user_display}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Library Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Library
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.library_display}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Application Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedApplication.created_at)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedApplication.is_active ? 'Approved' : 'Pending'}
                      color={selectedApplication.is_active ? 'success' : 'warning'}
                    />
                  </Box>
                </Grid>
                {selectedApplication.is_active && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Approved By
                        </Typography>
                        <Typography variant="body1">
                          {selectedApplication.granted_by_display || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Approval Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedApplication.granted_at ? formatDate(selectedApplication.granted_at) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Access Type
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.access_type_display}
                    </Typography>
                  </Box>
                </Grid>
                {selectedApplication.expires_at && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Expiration Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedApplication.expires_at)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedApplication.notes && (
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Application Notes
                      </Typography>
                      <Typography variant="body1">
                        {selectedApplication.notes}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedApplication && !selectedApplication.is_active && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setViewDialogOpen(false)
                    setApproveDialogOpen(true)
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setViewDialogOpen(false)
                    setRejectDialogOpen(true)
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {selectedApplication && selectedApplication.is_active && (
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setViewDialogOpen(false)
                  setRejectDialogOpen(true)
                }}
              >
                Revoke Access
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Approve Application Dialog */}
        <Dialog
          open={approveDialogOpen}
          onClose={() => !isProcessing && setApproveDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Approve Library Access</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to approve library access for {selectedApplication?.user_display}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApproveApplication}
              disabled={isProcessing}
              startIcon={isProcessing ? <LoadingSpinner size="sm" /> : <CheckCircle />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject/Revoke Application Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={() => !isProcessing && setRejectDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedApplication?.is_active ? 'Revoke Library Access' : 'Reject Library Access Application'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              {selectedApplication?.is_active
                ? `Are you sure you want to revoke library access for ${selectedApplication?.user_display}?`
                : `Are you sure you want to reject the library access application for ${selectedApplication?.user_display}?`
              }
            </Typography>
            <TextField
              label="Reason (Optional)"
              multiline
              rows={3}
              fullWidth
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRejectApplication}
              disabled={isProcessing}
              startIcon={isProcessing ? <LoadingSpinner size="sm" /> : <Cancel />}
            >
              {selectedApplication?.is_active ? 'Revoke Access' : 'Reject Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  )
}