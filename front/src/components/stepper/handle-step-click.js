'use client';

import { useRouter } from 'next/navigation';
import { paths } from 'src/routes/paths'; 

import { FormatRedditContent } from '../../utils/helpers';

const useHandleStepClick = () => {
  const router =  useRouter();

  const fetchThreadDetailsByUrl = async (url) => {
    const urld = `${url}.json`;
    try {
      const response = await fetch(urld);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const postTitle = data[0]?.data?.children[0]?.data?.title || '';
      const postBody = data[0]?.data?.children[0]?.data?.selftext || '';
      const comments = data[1]?.data?.children || [];
      const commentsBody = comments.map(comment => comment?.data?.body || '');

      const formattedText = FormatRedditContent(postTitle, postBody, commentsBody);

      localStorage.setItem("chatTitle", postTitle);
      localStorage.setItem("chatpreprompt", formattedText);
    } catch (error) {
      console.error('FetchThreadDetailsByUrl Error:', error);
    }
  };

  const handleStepClick = async ({ stepClicked }) => {
    console.log('stepClicked: ', stepClicked);
  
    if (stepClicked.index === 0) {
      router.push(paths.dashboard.tour.new);
    } else if (stepClicked.index === 1) {
      const projectID = localStorage.getItem('projectID');
      router.push(paths.dashboard.tour.job.new(projectID));
    } else if (stepClicked.index === 2) {
      const projectID = localStorage.getItem('projectID');
      router.push(paths.dashboard.tour.threads(projectID));
    } else if (stepClicked.index === 3) {
      const threadUrl = localStorage.getItem('threadUrl');
      await fetchThreadDetailsByUrl(threadUrl);
      router.push(paths.dashboard.post.root);
    }
  };

  return { handleStepClick };
};

export { useHandleStepClick };
