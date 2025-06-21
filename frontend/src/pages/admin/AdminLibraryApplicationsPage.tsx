import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import adminService, { LibraryAccess } from '../../services/adminService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import SimplePageHeader from '../../components/layout/SimplePageHeader';

const AdminLibraryApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<LibraryAccess[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('PENDING');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [showRejectionInput, setShowRejectionInput] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await adminService.getLibraryApplications({ status: filter });
      setApplications(response.data.results);
    } catch (error) {
      console.error('Error fetching library applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load library applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (accessId: string) => {
    try {
      await adminService.approveLibraryAccess(accessId);
      toast({
        title: 'Success',
        description: 'Library access application approved',
        variant: 'default',
      });
      fetchApplications();
    } catch (error) {
      console.error('Error approving library access:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve library access',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (accessId: string) => {
    try {
      await adminService.rejectLibraryAccess(accessId, rejectionReason[accessId] || '');
      toast({
        title: 'Success',
        description: 'Library access application rejected',
        variant: 'default',
      });
      setRejectionReason(prev => ({ ...prev, [accessId]: '' }));
      setShowRejectionInput(prev => ({ ...prev, [accessId]: false }));
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting library access:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject library access',
        variant: 'destructive',
      });
    }
  };

  const toggleRejectionInput = (accessId: string) => {
    setShowRejectionInput(prev => ({
      ...prev,
      [accessId]: !prev[accessId]
    }));
  };

  const handleRejectionReasonChange = (accessId: string, value: string) => {
    setRejectionReason(prev => ({
      ...prev,
      [accessId]: value
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <SimplePageHeader 
        title="Library Access Applications" 
        description="Manage user applications for access to your library"
      />

      <div className="mb-6 flex space-x-2">
        <Button 
          variant={filter === 'PENDING' ? 'default' : 'outline'} 
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </Button>
        <Button 
          variant={filter === 'APPROVED' ? 'default' : 'outline'} 
          onClick={() => setFilter('APPROVED')}
        >
          Approved
        </Button>
        <Button 
          variant={filter === 'REJECTED' ? 'default' : 'outline'} 
          onClick={() => setFilter('REJECTED')}
        >
          Rejected
        </Button>
        <Button 
          variant={filter === '' ? 'default' : 'outline'} 
          onClick={() => setFilter('')}
        >
          All
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No {filter.toLowerCase() || ''} applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{application.user_display}</CardTitle>
                    <CardDescription>{application.library_display}</CardDescription>
                  </div>
                  {getStatusBadge(application.status || 'PENDING')}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Applied:</span> {new Date(application.created_at).toLocaleDateString()}
                  </div>
                  {application.granted_at && (
                    <div className="text-sm">
                      <span className="font-medium">Processed:</span> {new Date(application.granted_at).toLocaleDateString()}
                    </div>
                  )}
                  {application.granted_by_display && (
                    <div className="text-sm">
                      <span className="font-medium">Processed by:</span> {application.granted_by_display}
                    </div>
                  )}
                  {application.notes && (
                    <div className="text-sm mt-2">
                      <span className="font-medium">Notes:</span>
                      <p className="whitespace-pre-line text-gray-600 mt-1">{application.notes}</p>
                    </div>
                  )}
                  {showRejectionInput[application.id] && (
                    <div className="mt-2">
                      <Input
                        placeholder="Reason for rejection"
                        value={rejectionReason[application.id] || ''}
                        onChange={(e) => handleRejectionReasonChange(application.id, e.target.value)}
                        className="mb-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              {filter === 'PENDING' && (
                <CardFooter className="bg-gray-50 flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => toggleRejectionInput(application.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    {showRejectionInput[application.id] ? 'Cancel' : 'Reject'}
                  </Button>
                  {showRejectionInput[application.id] ? (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleReject(application.id)}
                    >
                      Confirm Reject
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      onClick={() => handleApprove(application.id)}
                    >
                      Approve
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLibraryApplicationsPage;