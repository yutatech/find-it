import React from 'react';
import { List, ListItem, Button } from '@mui/material';

const LabelSelection = ({ labels, onSelect }) => (
    <List>
        {labels.map(label => (
            <ListItem key={label}>
                <Button onClick={() => onSelect(label)}>{label}</Button>
            </ListItem>
        ))}
    </List>
);
export default LabelSelection;
