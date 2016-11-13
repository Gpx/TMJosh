const { sample } = require('lodash')
const Twitter = require('simple-twitter')

const twitter = new Twitter(
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  process.env.TWITTER_ACCESS_TOKEN_KEY,
  process.env.TWITTER_ACCESS_TOKEN_SECRET
)

const promiseGet = api => (
  new Promise((resolve, reject) => {
    twitter.get(api, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
)

const promisePost = (api, opts = {}) => (
  new Promise((resolve, reject) => {
    twitter.post(api, opts, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
)

const getSuggestedCategory = () => promiseGet('users/suggestions')
const getUsersInCategory = ({ slug }) => promiseGet(`users/suggestions/${slug}`)
const followUser = ({ id }) => promisePost('friendships/create', { user_id: id })
const searchTweets = query => promiseGet(`search/tweets.json?q=${query}&count=100`)
const retweet = ({ id_str}) => promisePost(`statuses/retweet/${id_str}`)
const retweetAndFollow = tweet => (
  Promise.all([
    retweet(tweet),
    followUser(tweet.user),
  ])
)

const chooseRandomCategory = sample
const chooseRandomUser = sample
const chooseRandomTweet = sample
const notRetweetedOnly = tweets => tweets.filter(tweet => !tweet.retweeted)
const getOriginalTweet = tweet => tweet.retweeted_status || tweet

const followRandomUser = () => (
  getSuggestedCategory()
  .then(chooseRandomCategory)
  .then(getUsersInCategory)
  .then(({ users }) => chooseRandomUser(users))
  .then(followUser)
)

searchTweets('RT to win')
  .then(({ statuses }) => notRetweetedOnly(statuses))
  .then(chooseRandomTweet)
  .then(getOriginalTweet)
  .then(retweetAndFollow)
  .catch(console.error)
