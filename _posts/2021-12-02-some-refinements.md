---
layout: post
title:  "Some Refinements"
date:   2021-12-02 00:13:00 -0500
categories: go
tags: go generics advent
author: cshabsin
---
So I ran into some issues on day 1 of Advent of Code because my readinp
library failed to properly handle a text file without a trailing newline.
Ended up writing some really awkward code to make it work:

```go
  rdr := bufio.NewReader(f)
  for {
    line, readErr := rdr.ReadString('\n')
    if readErr == io.EOF && line == "" { // trailing newline
      close(ch)
      return
    } else if readErr != nil && readErr != io.EOF {
      ch <- Line[T]{Error: readErr}
      close(ch)
      return
    }
  ...
  }
```

So yeah, it turns out `ReadString(\n")` on a bufio.Reader is just an ugly way
to read a file by lines. During the day I looked around for better
alternatives, and voila, one was right there waiting for me: `bufio.Scanner`.

```go
  scanner := bufio.NewScanner(f)
  scanner.Split(bufio.ScanLines)
  for {
    if !scanner.Scan() {
      if err := scanner.Err(); err != nil {
        ch <- Line[T]{Error: err}
      }
      close(ch)
      return
    }
    line := scanner.Text()
	...
  }
```

Much more aesthetically pleasing.

I also prepared in advance of Day 2's problem being released:

```go
type foo struct {
  a int
  b string
}

func parseFoo(s string) (*foo, error) {
  arr := strings.Split(s, ",")
  a, err := strconv.Atoi(arr[0])
  if err != nil {
    return nil, err
  }
  return &foo{
    a: a,
    b: arr[1],
  }, nil
}
```

This proved invaluable when the actual problem came out, even though I
guessed the wrong ordering and delimiter on the line. Just 
[swap some things around](https://github.com/cshabsin/advent/commit/f22a09ae0f9d95c982888ff8a5e6de94f9b5285d#diff-ca0bb732dd3e99e811061842cd0c534b3c440a43046c8e36608eb246243543bd)
and I was all ready to parse "forward 5" into a direction and an
amount.

I lost a minute to a problem with pasting the answer from my terminal into
the browser (I think I pasted my entire input file into the field?) but I
ended up using that minute to reread the instructions, run the sample input
through my code, and find a bug (I was adding the distance for both down 
and up, having forgotten to change the operator when I copied the case block).

I feel I did pretty well, ranking #2146 overall on day 2. I don't think I'll
ever be a contender for the top 100 or anything, for two reasons. I'm not
*that* fast, and I'm not *that* precise. Need to work on both.

Anyway, here's my 12:30am blathering on the subject.
