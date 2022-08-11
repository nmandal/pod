import { useMemo } from 'react'
import Head from 'next/head'
import { parse } from 'rss-to-json'

import { useAudioPlayer } from '@/components/AudioProvider'
import { Container } from '@/components/Container'
import { FormattedDate } from '@/components/FormattedDate'
import { PlayButton } from '@/components/player/PlayButton'

export default function Episode({ episode }) {
  episode = {
    id: '1',
    title: '1: Longevity',
    description:
      'We define longevity as a function of two things, lifespan (how long you live) and healthspan (how well you live). Longevity is not just about living longer, it’s about reducing the amount of time you spend in the final stages of decline by “squaring your longevity curve”.',
    content:
      '<h2 id="topics">Topics</h2>\n<ul>\n<li>Quibusdam saepe veritatis unde ea omnis repudiandae neque unde sapiente</li>\n<li>Praesentium velit ratione</li>\n<li>Deserunt ullam sit perspiciatis</li>\n<li>Omnis occaecati tempore numquam delectus iste iste odio</li>\n<li>Est qui consequuntur quis quia quod ipsum consectetur ad aperiam</li>\n<li>Voluptate laborum cum dignissimos esse debitis incidunt tempore</li>\n</ul>\n<h2 id="sponsors">Sponsors</h2>\n<ul>\n<li><a href="#">Athletic Greens</a> — I take a scoop of Athletic Greens every day, regardless of what else I’m eating</li>\n<li><a href="#">Creatine</a> — Take it for muscle building.</li>\n</ul>\n<h2 id="links">Links</h2>\n<ul>\n<li><a href="#">Quis laboriosam</a> molestiae tempore necessitatibus</li>\n<li><a href="#">Sit autem</a> neque minima itaque sit commodi</li>\n<li>Eos ratione <a href="#">blanditiis</a></li>\n<li>Eius a <a href="#">qui quasi</a></li>\n<li>Laborum laudantium sunt <a href="#">mollitia aliquam</a> corporis</li>\n</ul>\n',
    published: 1643241600000,
    audio: {
      src: '',
      type: 'audio/mpeg',
    },
  }
  let date = new Date(episode.published)

  let audioPlayerData = useMemo(
    () => ({
      title: episode.title,
      audio: {
        src: episode.audio.src,
        type: episode.audio.type,
      },
      link: `/${episode.id}`,
    }),
    [episode]
  )
  let player = useAudioPlayer(audioPlayerData)

  return (
    <>
      <Head>
        <title>{`${episode.title} - Healthy Dose`}</title>
        <meta name="description" content={episode.description} />
      </Head>
      <article className="py-16 lg:py-36">
        <Container>
          <header className="flex flex-col">
            <div className="flex items-center gap-6">
              <PlayButton player={player} size="large" />
              <div className="flex flex-col">
                <h1 className="mt-2 text-4xl font-bold text-slate-900">
                  {episode.title}
                </h1>
                <FormattedDate
                  date={date}
                  className="order-first font-mono text-sm leading-7 text-slate-500"
                />
              </div>
            </div>
            <p className="ml-24 mt-3 text-lg font-medium leading-8 text-slate-700">
              {episode.description}
            </p>
          </header>
          <hr className="my-12 border-gray-200" />
          <div
            className="prose prose-slate mt-14 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>h2:nth-of-type(3n)]:before:bg-violet-200"
            dangerouslySetInnerHTML={{ __html: episode.content }}
          />
        </Container>
      </article>
    </>
  )
}

export async function getStaticProps({ params }) {
  let feed = await parse('https://their-side-feed.vercel.app/api/feed')
  let episode = feed.items
    .map(({ id, title, description, content, enclosures, published }) => ({
      id: id.toString(),
      title: `${id}: ${title}`,
      description,
      content,
      published,
      audio: enclosures.map((enclosure) => ({
        src: enclosure.url,
        type: enclosure.type,
      }))[0],
    }))
    .find(({ id }) => id === params.episode)

  if (!episode) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      episode,
    },
    revalidate: 10,
  }
}

export async function getStaticPaths() {
  let feed = await parse('https://their-side-feed.vercel.app/api/feed')

  return {
    paths: feed.items.map(({ id }) => ({
      params: {
        episode: id.toString(),
      },
    })),
    fallback: 'blocking',
  }
}
