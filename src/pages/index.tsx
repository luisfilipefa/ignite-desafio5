import { Box, Button } from '@chakra-ui/react';
import { useInfiniteQuery } from 'react-query';
import { useMemo } from 'react';
import Head from 'next/head';

import { CardList } from '../components/CardList';
import { Error } from '../components/Error';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { api } from '../services/api';

interface Card {
  url: string;
  title: string;
  description: string;
  id: string;
  ts: number;
}
interface getImagesResponse {
  after: string | null;
  data: Card[];
}

export default function Home(): JSX.Element {
  const getImages = async ({
    pageParam = null,
  }): Promise<getImagesResponse> => {
    if (pageParam) {
      const { data } = await api.get('/api/images', {
        params: {
          after: pageParam,
        },
      });

      return data;
    }

    const { data } = await api.get('/api/images');

    return data;
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', getImages, {
    getNextPageParam: lastPage => lastPage.after,
  });

  const formattedData = useMemo(() => {
    let cards = [] as Card[];

    data?.pages.forEach(page => {
      cards = [...cards, ...page.data];
    });

    return cards;
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Head>
        <title>Upfi</title>
        <link rel="shortcut icon" href="logo.svg" />
      </Head>

      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button mt="1rem" onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}
