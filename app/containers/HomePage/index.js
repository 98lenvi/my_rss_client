/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
//import Feed from 'rss-to-json';

import Parser from 'rss-parser';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tooltip,
  Chip,
  TablePagination,
  TextField,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  table: {
    //wordWrap: 'break-word',
    whiteSpace:'nowrap'
  },
}));

let parser = new Parser();
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export default function HomePage() {
  const [link, setLink] = useState(undefined);
  const [rssObject, setRssObject] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const classes = useStyles();

  const requestRss = link => {
    // Feed.load(link, function(err, rss) {
    //   if (rss) {
    //     setRssObject(rss.items);
    //     console.log(rss)
    //   }
    // });
    (async () => {
      setLoading(true);
      let feed = await parser.parseURL(CORS_PROXY + link);
      // console.log(feed.title);
      setLoading(false);
      setRssObject(feed.items);
      // feed.items.forEach(item => {
      //   console.log(item.title + ':' + item.link)
      // });
    })();
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, page) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function validateIfAudioRss(){
    console.log(rssObject[0])
    const url = new URL(rssObject[0].enclosure.url);
    try{if(url.pathname.split('.').pop()==='mp3'){
      alert(url.pathname.split('.').pop())
      alert('audio')
    }else{
      alert(url.pathname.split('.').pop())
      alert('not audio')
    }}catch{
      alert(url.pathname.split('.').pop())
      alert('not audio')
    }
  }

  return (
    <>
      <TextField
        label="Enter RSS link here"
        variant="outlined"
        onChange={event => setLink(event.target.value)}
      />
      <Button onClick={() => requestRss(link)} variant="contained">
        Request
      </Button>
      <Button onClick={validateIfAudioRss} variant="contained">
        Validate if audio RSS
      </Button>
      {loading && <CircularProgress />}
      {rssObject && (
        <TableContainer component={Paper}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={rssObject.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
          <Table
            size="small"
            aria-label="simple table"
            stickyHeader={true}
            style={{overflowX:'auto' }}
          >
            <TableHead>
              <TableRow>
                {Object.keys(rssObject[0]).map((item, index) => {
                  if (item === 'itunes') {
                    console.log(rssObject[0].itunes);
                    return Object.keys(rssObject[0].itunes).map(
                      (subItem, index) => (
                        <TableCell className={classes.table}>
                          {'iTunes:' + subItem}
                        </TableCell>
                      ),
                    );
                  } else {
                    return (
                      <TableCell className={classes.table}>{item}</TableCell>
                    );
                  }
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rssObject
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => {
                  return (
                    <TableRow>
                      {Object.keys(item).map(function(key, index) {
                        if (key === 'enclosure') {
                          if (item[key]) {
                            let enclosure = item[key];
                            return (
                              <Tooltip title={key}>
                                <TableCell className={classes.table}>
                                  <audio controls>
                                    <source src={enclosure.url} />
                                  </audio>
                                  <Chip label={enclosure.length} />
                                  <Chip label={enclosure.type} />
                                </TableCell>
                              </Tooltip>
                            );
                          }
                        } else if (key === 'guid') {
                          return (
                            <Tooltip title={key}>
                              <TableCell className={classes.table}>
                                {JSON.stringify(item[key])}
                              </TableCell>
                            </Tooltip>
                          );
                        } else if (key === 'content:encoded') {
                          var el = document.createElement('html');
                          el.innerHTML = item[key];
                          return (
                            <Tooltip title={key}>
                              <TableCell className={classes.table}>
                                {el.innerText}
                              </TableCell>
                            </Tooltip>
                          );
                        } else if (key === 'link') {
                          console.log('link');
                          return (
                            <Tooltip title={key}>
                              <TableCell className={classes.table}>
                                <a src={item[key]}>{item[key]}</a>
                              </TableCell>
                            </Tooltip>
                          );
                        } else if (key === 'itunes') {
                          console.log('link');
                          return (
                            <>
                              <Tooltip title={key}>
                                <TableCell className={classes.table}>
                                  {item[key].author}
                                </TableCell>
                              </Tooltip>
                              <Tooltip title={key}>
                                <TableCell className={classes.table}>
                                  {item[key].summary}
                                </TableCell>
                              </Tooltip>
                              <Tooltip title={key}>
                                <TableCell className={classes.table}>
                                  {item[key].explicit}
                                </TableCell>
                              </Tooltip>
                              <Tooltip title={key}>
                                <TableCell className={classes.table}>
                                  {item[key].duration}
                                </TableCell>
                              </Tooltip>
                              <Tooltip title={key}>
                                <TableCell className={classes.table}>
                                <img src={item[key].image} height={'100'}/>
                                </TableCell>
                              </Tooltip>
                              <Tooltip title={key}>
                                <TableCell className={classes.table}>
                                 {item[key].episode}
                                </TableCell>
                              </Tooltip>
                            </>
                          );
                        } else {
                          return (
                            <Tooltip title={key}>
                              <TableCell className={classes.table}>
                                {JSON.stringify(item[key])}
                              </TableCell>
                            </Tooltip>
                          );
                        }
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* {rssObject.map((item, index) => {
        return (
          <tr>
            <th>{item.title}</th>
            <th>{item.desciption}</th>
            <th>
              <button
                onClick={() => {
                  setId(index);
                }}
              >
                click to play
              </button>
            </th>
            <th>
              {item.enclosures.map(enclosure => {
                return (
                  <>
                    {enclosure.type === 'audio/mpeg' && id === { index } && (
                      <audio controls>
                        <source src={enclosure.url} />
                      </audio>
                    )}
                  </>
                );
              })}
              }
            </th>
          </tr>
        );
      })} */}
    </>
  );
}
