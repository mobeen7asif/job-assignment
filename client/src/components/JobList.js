import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link
} from '@mui/material';

const JobList = ({ jobs, client }) => {
  return (

    <TableContainer component={Paper}>
      <Table aria-label="job listing table">
        <TableHead>
          <TableRow>
            <TableCell>JobID</TableCell>
            <TableCell>Client Email</TableCell>
            <TableCell>Job Status</TableCell>
            <TableCell>Image URL</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.id}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{job.status}</TableCell>
              <TableCell>
                {job.imageUrl ? (
                  <Link href={job.imageUrl} target="_blank" rel="noopener">
                    <img src={job.imageUrl} alt="Job Image" style={{ width: 50, height: 50 }} />
                  </Link>
                ) : (
                  'N/A'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    // <List>
    //   {jobs.map((job) => (
    //     <ListItem key={job.id}>
    //       <ListItemText
    //         primary={`Job ID: ${job.id}`}
    //         secondary={
    //           job.status === 'resolved' ? (
    //             <Card>
    //               <CardContent>
    //                 <Typography variant="body2">Image URL: {job.imageUrl}</Typography>
    //                 <img src={job.imageUrl} alt="Random Food" style={{ maxWidth: '100%' }} />
    //               </CardContent>
    //             </Card>
    //           ) : (
    //             'Pending'
    //           )
    //         }
    //       />
    //     </ListItem>
    //   ))}
    // </List>
  );
};

export default JobList;
