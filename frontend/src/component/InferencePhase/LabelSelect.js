import { useContext } from "react";
import { Autocomplete, TextField } from '@mui/material';
import { Row } from "react-bootstrap";
import { LabelContext } from "../../modules/LabelContext";

import { styled } from '@mui/material/styles';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiInputBase-input': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  '& .MuiInputBase-input.Mui-focused': {
    color: 'rgba(255, 255, 255, 1)',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'rgba(255, 255, 255, 1)',
  },
}));

function LabelSelect() {
  const { label, labelList, setTargetLabel } = useContext(LabelContext);

  // ラベルを選択したときの処理
  const handleLabelChange = (event, newValue) => {
    if (newValue) {
      setTargetLabel(newValue);
    }
  };

  return (
    <Row className="col-8 col-sm-8 col-md-6 col-lg-3 col-xl-3" style={{ marginTop: '2vh' }}>
      <Autocomplete
        options={labelList}
        value={label}
        onChange={handleLabelChange}
        // open // 常に候補を表示する
        // disableCloseOnSelect // 候補を選択してもリストが閉じないようにする
        renderInput={(params) => <CustomTextField {...params} label="ラベルを選択" inputProps={{ ...params.inputProps, readOnly: true }} />}
        fullWidth
      />
    </Row>
  );
}

export default LabelSelect;