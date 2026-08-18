"use client"

import { Box, Divider } from "@mui/material"
import Image from "next/image"
import { PLATFORMS } from "src/utils/constants";

import MetricsCard from "../../components/metrics-card/index"

export const MetricsView = ({
  platforms,
  handleMetricChange,
  redditFilters,
  youtubeFilters
}) => {
  const youtubeMetrics = [
    {
      name: "Views",
      icon: <Image src="/assets/eye-filled.svg" width={20} height={20} />,
      defaultMode: "range",
      defaultMin: 100,
      defaultMax: 10000,
      absoluteMax: 10000000,
      suggestedRange: "More Views = Wider Audience Reach (But Reduces Results)",
    },
    {
      name: "Likes",
      icon: <Image src="/assets/thumbs-up.svg" width={20} height={20} />,
      defaultMode: "range",
      defaultMin: 100,
      defaultMax: 1000,
      absoluteMax: 10000000,
      suggestedRange: "More Likes = Increased Virility (But Reduces Results)",
    },
    {
      name: "Comments",
      icon: <Image src="/assets/chat.svg" width={20} height={20} />,
      defaultMode: "range",
      defaultMin: 100,
      defaultMax: 1000,
      absoluteMax: 10000000,
      suggestedRange: "More Comments = Engaged Audience (But Reduces Results)",
    },
  ]

  const redditMetrics = [
    {
      name: "Threads",
      icon: <Image src="/assets/astronomy.svg" width={20} height={20} />,
      defaultMode: "range",
      defaultMin: 100,
      defaultMax: 200,
      absoluteMax: 1000,
      suggestedRange: "More Threads = Wider Audience Reach (But Reduces Results)",
    },
    {
      name: "UpVotes",
      icon: <Image src="/assets/chat-going.svg" width={20} height={20} />,
      defaultMode: "range",
      defaultMin: 100,
      defaultMax: 1000,
      absoluteMax: 10000000,
      suggestedRange: "More UpVotes = More Treading Potential (But Reduces Results)",
    },
    {
      name: "Comments",
      icon: <Image src="/assets/chat.svg" width={20} height={20} />,
      defaultMode: "range",
      defaultMin: 100,
      defaultMax: 1000,
      absoluteMax: 10000000,
      suggestedRange: "More Comments = Deeper Engagement (But Reduces Results)",
    },
  ]

  return (
    <Box display="grid" sx={{
      gridTemplateColumns: {
        xs: '1fr',
        sm: '1fr 1fr'
      },
      gap: 2,
    }}>
      {platforms.reddit && (
        <>
          <MetricsCard
            title="Reddit Metrics"
            icon={
            <Image src="/assets/reddit-icon.svg" width={20} height={20} />
          }
            filters={redditFilters}
            platform={PLATFORMS.REDDIT}
            metrics={redditMetrics} 
            handleMetricChange={handleMetricChange}
          />

          <Divider sx={{
            display: {
              xs: 'block',
              sm: 'none'
            },
            borderColor: '#000000'
          }}
          />
        </>
      )

      }
      {platforms.youtube &&
        <MetricsCard
          title="Youtube Metrics"
          icon={
          <Image src="/assets/youtube-icon.svg" width={20} height={20} />
        }
          filters={youtubeFilters}
          platform={PLATFORMS.YOUTUBE}
          metrics={youtubeMetrics}
          handleMetricChange={handleMetricChange}
        />
      }
    </Box>
  )
}
