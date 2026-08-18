"use client"

import { useEffect, useState } from "react"
import { Typography, Tabs, Tab, Box, TextField, Slider, Stack } from "@mui/material"
import { styled } from "@mui/material/styles"
import Image from "next/image"
import { camelCase, isEmpty, startCase } from "lodash"

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 28,
  background: '#63AA58',
  borderRadius: '5px',
  display: 'flex',
  maxWidth: '280px',
  margin: 'auto',
  justifyContent: 'space-between !important',
  gridGap: '8px',
  alignItems: 'center',
  marginBottom: '12px !important',
  "& .css-1pyy021-MuiTabs-flexContainer": {
    display: 'flex',
    justifyContent: 'space-between',
    gridGap: '8px',
    padding: '2px 3px',
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 24,
  minWidth: "auto",
  padding: "3px 16px",
  borderRadius: '5px',
  textTransform: "none",
  fontSize: "14px",
  fontWeight: "bold",
  background: 'transparent',
  color: '#FFFFFF',
  "&.css-m39zwt-MuiButtonBase-root-MuiTab-root:not(.Mui-selected)": {
    color: '#FFFFFF !important',
  },
  '&.MuiTabs-flexContainer':{
    display:'flex',
    justifyContent: 'space-between'
  },
  "&.Mui-selected": {
    color: "#1A1A1A !important",
    backgroundColor: "#FFFFFF",
  },
  "&.MuiButtonBase-root": {
    margin: '0px !important',
    color: '#FFFFFF',
  },
  "&:hover": {
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
  "&.Mui-selected:hover": {
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
}))

const GreenSlider = styled(Slider)(({ theme }) => ({
  color: "#4caf50",
  height: 8,
  padding: '5px 0 !important',
  "& .MuiSlider-track": {
    border: "none",
    backgroundColor: "#4caf50",
  },
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: "#4caf50",
    border: "3px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "0 2px 8px rgba(76, 175, 80, 0.4)",
    },
  },
  "& .MuiSlider-rail": {
    color: theme.palette.grey[300],
    opacity: 1,
  },
}))

const formatValue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`
  } if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
  }
  return value.toString()
}

const parseValue = (formattedValue) => {
  if (typeof formattedValue === "number") return formattedValue

  const str = formattedValue.toString().toUpperCase()
  const num = Number.parseFloat(str)

  if (str.includes("M")) {
    return num * 1000000
  } if (str.includes("K")) {
    return num * 1000
  }
  return num || 0
}

const MetricSlider = ({
  mode,
  minValue,
  maxValue,
  absoluteMin = 0,
  absoluteMax = 10000000,
  onMinChange,
  onMaxChange,
  step = 1000,
}) => {
  const handleSliderChange = (event, newValue) => {
    if (mode === "range") {
      onMinChange(newValue[0])
      onMaxChange(newValue[1])
    } else if (mode === "upto") {
      onMaxChange(newValue)
    } else if (mode === "morethan") {
      onMinChange(newValue)
    }
  }

  const getSliderValue = () => {
    if (mode === "range") {
      return [minValue, maxValue]
    } if (mode === "upto") {
      return maxValue
    } if (mode === "morethan") {
      return minValue
    }
    return 0
  }

  const getSliderProps = () => {
    const baseProps = {
      value: getSliderValue(),
      onChange: handleSliderChange,
      min: absoluteMin,
      max: absoluteMax,
      step,
    }

    if (mode === "range") {
      return {
        ...baseProps,
      }
    } if (mode === "upto") {
      return {
        ...baseProps,
        track: "normal",
      }
    } if (mode === "morethan") {
      return {
        ...baseProps,
        track: "inverted",
      }
    }

    return baseProps
  }

  return <GreenSlider {...getSliderProps()} />
}

const MetricsCard = ({
  title,
  icon,
  metrics = [],
  platform,
  defaultTab = 0,
  handleMetricChange,
  filters
 }) => (
  <Box>
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Stack>

      {metrics.map((metric, index) => (
        <MetricItem key={index} {...metric} filters={filters} platform={platform} handleMetricChange={handleMetricChange} />
      ))}
    </Box>
  </Box>
)

const MetricItem = ({
  name,
  key,
  icon,
  defaultMode = "upto",
  defaultMin = 0,
  defaultMax = 1000000,
  absoluteMin = 0,
  absoluteMax = 10000000,
  step = 1000,
  suggestedRange = "100-1000",
  uptoValue = "100",
  handleMetricChange,
  platform,
  filters
}) => {
  const [mode, setMode] = useState(filters?.mode)
  const [minValue, setMinValue] = useState(filters?.min)
  const [maxValue, setMaxValue] = useState(filters?.max)

  const defaultMinMax  = {
    youtube: {
      views: { min: 100, max: 500 },
      likes: { min: 10, max: 50 },
      comments: { min: 5, max: 10 }
    },
    reddit: {
      threads: { min: 100, max: 200 },
      upVotes: { min: 2, max: 5 },
      comments: { min: 2, max: 5 }
    }
  }

  useEffect(() => {
    const { min, max, mode: modeVal } = filters[camelCase(name)];

    setMinValue(min);
    setMaxValue(max);
    setMode(modeVal);
  }, []);

  const handleTabChange = (event, newValue) => {
    const modes = ["upto", "range", "morethan"]

    setMode(modes[newValue])

    let { min = 0, max = 1000000 } = defaultMinMax[platform][camelCase(name)];

    if (modes[newValue] === "upto") min = 0;
    if (modes[newValue] === "morethan") max = 1000000;

    const newMinValue = min;
    const newMaxValue = max;

    setMinValue(min);
    setMaxValue(max);
  
    handleMetricChange({
      platform,
      min: newMinValue,
      max: newMaxValue,
      key: name,
      mode: modes[newValue]
    });
  }

  const handleMinInputChange = (event) => {
    console.log('event.target.value: ', event.target.value);

    let value = "";
    if (event.target.value !== "") value = parseValue(event.target.value);

    console.log('here the number: ', value);

    if (!Number.isNaN(value)) {
      setMinValue(value);

      console.log('here inside the handle');
      handleMetricChange({
        platform,
        min: value,
        max: maxValue,
        key: name,
        mode
      });

    }
  }

  const handleMaxInputChange = (event) => {
    let value = "";
    if (event.target.value !== "") value = parseValue(event.target.value);

    if (!Number.isNaN(value)) {
      setMaxValue(value);

      handleMetricChange({
        platform,
        min: minValue,
        max: value,
        key: name,
        mode
      });

    }
  };
  const getCurrentTabIndex = () => {
    const modes = ["upto", "range", "morethan"]
    return modes.indexOf(mode)
  }

  const renderInputFields = () => {
    if (mode === "upto") {
      return (
        <Stack direction="row" alignItems="center" spacing="47px" sx={{ mb: '10px !important' }}>
          {/* <TextField fullWidth size="small" value={minValue} disabled sx={{ maxWidth: '100%' }} />
          <Typography variant="body2" fontSize={12} fontWeight={600} color="#000000">
            To
          </Typography> */}
          <TextField fullWidth size="small" value={maxValue} onChange={handleMaxInputChange} sx={{ maxWidth: '100%' }} />
        </Stack>
      );
    }

    if (mode === "range") {
      return (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: '10px !important' }}>
          <TextField fullWidth size="small" value={minValue} onChange={handleMinInputChange} sx={{ maxWidth: '100%' }} />
          <Typography variant="body2" fontSize={12} fontWeight={600} color="#000000">
            To
          </Typography>
          <TextField fullWidth size="small" value={maxValue} onChange={handleMaxInputChange} sx={{ maxWidth: '100%' }} />
        </Stack>
      );
    }

    if (mode === "morethan") {
      return (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: '10px !important' }}>
          <TextField fullWidth size="small" value={minValue} onChange={handleMinInputChange} sx={{ maxWidth: '100%' }} />
          {/* <Typography variant="body2" fontSize={12} fontWeight={600} color="#000000">
            To
          </Typography>
          <TextField fullWidth size="small" value={maxValue} disabled sx={{ maxWidth: '100%' }} /> */}
        </Stack>
      );
    }
    return null;
  };

  return (
    <Box sx={{ mb: '27px' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography fontSize={14} fontWeight="600" color="#000000">
          {name}
        </Typography>
      </Stack>

      <StyledTabs className="metric-tabs-wrapper" value={getCurrentTabIndex()} onChange={handleTabChange} sx={{ mb: 2 }}>
        <StyledTab label="Up to" />
        <StyledTab label="Range" />
        <StyledTab label="More than" />
      </StyledTabs>

      {renderInputFields()}

      <Box>
        <MetricSlider
          mode={mode}
          minValue={minValue}
          maxValue={maxValue}
          absoluteMin={absoluteMin}
          absoluteMax={absoluteMax}
          onMinChange={setMinValue}
          onMaxChange={setMaxValue}
          step={platform === "reddit" && name === "Threads" ? 10 : step}
        />
      </Box>

      <Stack direction="row" alignItems="center" mt='8px' spacing={1}>
        {/* <Image src="/assets/bulb.svg" width={20} height={20} /> */}
        <Typography fontSize={11} color="red" fontWeight="500">
          {suggestedRange}
        </Typography>
      </Stack>
    </Box>
  )
}

export default MetricsCard;
