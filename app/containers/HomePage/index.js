/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React, { useEffect, useState } from 'react';
import Parser from 'rss-parser';
import AudioPlayer from 'react-h5-audio-player';
import './playstyle.css';
import {
  SaveToLocalStorage,
  GetFromLocalStorage,
  ClearLocalStorage,
  CORS_PROXY
} from '../../utils/helpers';
import { Link } from 'react-router-dom';
import {
  Article,
  FlexRow,
  FlexColumn,
  Thumbnail,
  H2,
  Button,
  P,
  Span,
  PaginationWrapper,
  PageWrapper,
  H1,
  ControlSectionWrapper,
  MainInput,
  MainForm,
  MainSubmit,
  HistorySection,
  IconButton,
  AudioPlayerWrapper,
  Padding
} from '../../components';
import axios from 'axios';
import Fuse from 'fuse.js'

const options = {
  keys: [
    "title"
  ]
};


let parser = new Parser({
  headers: { 'User-Agent': 'Spotify' },
});

const CopyToClipboard = async (text) => {
  navigator.clipboard.writeText(text).then(function () {
    alert('Copied to clipboard')
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

const setAudioInformation = (item) => {
  try {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = item.itunes.image;
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = item.title;  
  } catch (error) {
    
  }
  
}

export default function HomePage() {

  const url = new URL(window.location.href);
  const [link, setLink] = useState(undefined);
  const [rssObject, setRssObject] = useState([]);
  const [searchObject, setSearchObject] = useState([])
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(GetFromLocalStorage());
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [audioSrc, setAudioSrc] = useState('');
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');



  let fuse = new Fuse(rssObject, options);
  
  const Element = ({ item, index }) => {
    console.log(item)
    const guid = item.guid;
    const thumbnailSRC = item.itunes.image;
    const title = item.title;
    const isPlaying = audioSrc === item.enclosure.url;
    const audioLink = item.enclosure.url;
    const shareLink = `${url.host}?rss=${link}&page=${page ? page : 0}&id=${item.guid}`
    const shareAction = () => CopyToClipboard(shareLink);
    const description = item.content;
    return (
      <Article>
        <FlexRow>
          <Thumbnail src={thumbnailSRC} />
          <FlexColumn>
            <H2 id={guid}>{title}</H2>
            <FlexRow>
              <Button
                disabled={isPlaying}
                onClick={() => {setAudioSrc(audioLink);               setAudioInformation(item);                }}>
                {isPlaying ? 'PLAYING' : 'PLAY ▶'}
              </Button>
              <Button
                onClick={shareAction}>
                SHARE
          </Button>
            </FlexRow>
          </FlexColumn>
          </FlexRow>
          <FlexRow>
            <FlexColumn>
            <div style={{maxWidth: '650px',width: '85vw'}} dangerouslySetInnerHTML={{__html:description}}/>
            </FlexColumn>
          </FlexRow>
      </Article>
    )
  }

  const PaginationControls = () => {
    const isPage0 = page == 0;
    const goToPreviousPage = () => setPage(page - 1);
    const endIndex = (page + 1) * rowsPerPage;
    const totalItems = rssObject.length;
    const isLastPage = endIndex > totalItems;
    const goToNextPage = () => setPage(page + 1);
    const startIndex = (page * rowsPerPage) + 1;
    const displayString = `${startIndex} - ${isLastPage ? totalItems : endIndex} of ${totalItems}`
    return <PaginationWrapper>
      <Button
        disabled={isPage0}
        onClick={goToPreviousPage}>
        BACK
</Button>
      <Span
      >
        {displayString}
      </Span>

      < Button
        disabled={isLastPage}
        onClick={goToNextPage}>
        NEXT
</Button>
    </PaginationWrapper>
  }

  const SearchPaginationControls = () => {
    const isPage0 = page == 0;
    const goToPreviousPage = () => setPage(page - 1);
    const endIndex = (page + 1) * rowsPerPage;
    const totalItems = searchObject.length;
    const isLastPage = endIndex > totalItems;
    const goToNextPage = () => setPage(page + 1);
    const startIndex = (page * rowsPerPage) + 1;
    const displayString = `${startIndex} - ${isLastPage ? totalItems : endIndex} of ${totalItems}`
    return <PaginationWrapper>
      <Button
        disabled={isPage0}
        onClick={goToPreviousPage}>
        BACK
</Button>
      <Span
      >
        {displayString}
      </Span>

      < Button
        disabled={isLastPage}
        onClick={goToNextPage}>
        NEXT
</Button>
    </PaginationWrapper>
  }

  useEffect(
    () => {
      let rssQueryParameter = url.searchParams.get("rss");
      if (rssQueryParameter)
        requestRss(rssQueryParameter);

    try {
      let allrssQueryParameter = url.searchParams.get("allrss");
      if (allrssQueryParameter){
        let decoded = decodeURIComponent(allrssQueryParameter);
        let parsed = JSON.parse(decoded)
        parsed.map((item)=>SaveToLocalStorage(item.title, item.link))
        setHistory(parsed)
      }
    } catch (error) {
      console.log(error)
    }
    }
    
    , []);

  const requestRss = link => {
    let feed
    (async () => {
      try {
        setSearch('')
        setLink(link);
        setRssObject([])
        let recievedPage = parseInt(url.searchParams.get("page"), 10)
        if (recievedPage) {
          setPage(recievedPage)
        }
        setLoading(true);
        feed = await parser.parseURL(CORS_PROXY + link);
        setLoading(false);
        setRssObject(feed.items);
        fuse = new Fuse(feed.items, options);
        SaveToLocalStorage(feed.title, link);
        setHistory(GetFromLocalStorage())
        //setAudioSrc(feed.items[0].enclosure.url);
        setAudioInformation(feed.items[0]);
        sendDetails(email)
      } catch (error) {
        setLoading(false);
        alert('Not a valid podcast / Network issues');
      }
      try {
        let id = url.searchParams.get("id")
        if (id) {
          var elmnt = document.getElementById(id).scrollIntoView();
          console.log(elmnt)
          feed.items.map(item => {
            if (item.guid == id) {
              setAudioSrc(item.enclosure.url);
            }
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
    )();
  };




const naviagteToOtherPodcast = link => {
  setLink(link);
  requestRss(link)
}

const generateLink = link => `?rss=${link}&page=${0}`;
const clearHistory = () => {
  ClearLocalStorage()
  setHistory(undefined)
}

const generateAllLink = () => {
  let history = GetFromLocalStorage();
  if(history){
    let stringifiedHistory = JSON.stringify(history);
    let encoded = encodeURIComponent(stringifiedHistory);
    let sharelink = `${url.host}?allrss=${encoded}`;
    CopyToClipboard(sharelink);
  }
};

const unspaceAndtolower = text => text.toLowerCase().replace(/\s/g, '')

const getDetails = async () => {
  setLoading(true);
  try {
    const message = {
      method : `GET`,
      url : `https://om4psrsg18.execute-api.ap-south-1.amazonaws.com/Prod/user?email=${unspaceAndtolower(email)}`
    };
    const response = await axios(message)    
    if(typeof response.data === "object"){
      if(response.data.length>0){
        setHistory(response.data)
        response.data.map((item)=>SaveToLocalStorage(item.title, item.link))
      }
    }
  } catch (error) {
    
  } finally {
    setLoading(false);
  }
  
}

const sendDetails = async () => {
  setLoading(true);
  try {
    const message = {
      method : `PUT`,
      url : `https://om4psrsg18.execute-api.ap-south-1.amazonaws.com/Prod/user?email=${unspaceAndtolower(email)}`,
      data : {data:history}
    };
    await axios(message) 
    
  } catch (error) {
    
  } finally {
    setLoading(false);
  }
    
}

const History =  () => {
return(
  <HistorySection>
    <ul>
      {history.map( (item,index) =>
        <li
          key={index}
          >
          <Link
            key={index}
            onClick={() => naviagteToOtherPodcast(item.link)}
            to={() => generateLink(item.link)}>
              {item.title}
          </Link>
        </li>
        )}
        <li style={{marginTop:'2%'}}>      
          <Button
          onClick={clearHistory}
        >
          CLEAR HISTORY
        </Button>
        </li>
    </ul>
  </HistorySection>)
}


const Heading = () => {
  return (
    <H1>
      {loading ? `Loading..` : `Podcast Client`}
    </H1>
  )
}

useEffect(()=>{
let tempArray = []
let resultFromFuse = fuse.search(search);
resultFromFuse.map((item)=>tempArray.push(item.item));
setSearchObject(tempArray)
},[search])
  return (
    <PageWrapper>
      <AudioPlayerWrapper
      >
        <AudioPlayer
          autoPlay
          src={audioSrc} 
          />
      </AudioPlayerWrapper>
      <ControlSectionWrapper>
        <MainForm onSubmit={e=>{e.preventDefault();getDetails(email)}}>
      <MainInput
        onChange={event => setEmail(event.target.value)}
        disabled={loading}
        placeholder={'Enter Email'}
        type='email'
        required
      />
  </MainForm>
  <MainForm onSubmit={e=>{e.preventDefault();requestRss(link)}}>
      <MainInput
        onChange={event => setLink(event.target.value)}
        defaultValue={link}
        disabled={loading}
        placeholder={'Enter RSS link here'}
      />
  </MainForm>
<MainForm  onSubmit={e=>{e.preventDefault()}}>
<MainInput placeholder='🔍 Search' value={search} onChange={(e)=>setSearch(e.target.value)}/>
  </MainForm>
        
      </ControlSectionWrapper>
      {history &&
        <History/>
      }
      {(rssObject.length > 0 && !search) ?
        <PaginationControls /> :
        (searchObject.length ? <SearchPaginationControls/> : '')
      }
      {(searchObject.length != 0) && 
        searchObject
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(
            (item, index) => <Element item={item} key={index} />
          )
      }
      {(rssObject && !search) && 
        rssObject
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map(
            (item, index) => <Element item={item} key={index + (page * rowsPerPage)} />
          )
      }
      {(rssObject.length > 0 && !search) ?
        <PaginationControls /> :
        (searchObject.length ? <SearchPaginationControls/> : '')
      }
      <Padding />
    </PageWrapper>
  );
}
