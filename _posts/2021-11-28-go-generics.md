---
layout: post
title:  "Messing around with Go with Generics"
date:   2021-11-28 15:19:00 -0500
categories: meta
tags: go generics advent
author: cshabsin
---
I decided to start playing around with Go 1.18 before they release the
official Beta, since I want to use it in this year's 
[Advent of Code](https://adventofcode.com) contest.

I started trying to get a feel for them by tweaking some code leftover
from previous years' projects.

I decided to start with my code for reading in the content of an input file
(pretty much part of every single AoC problem). I have been using this
function in past years:

```go
package readinp

// Read starts a goroutine that yields lines on the output channel.
func Read(filename string) (chan Line, error) {
```

The basic idea is, you call readinp.Read on a file, and get back a channel
that provides "lines", with a the contents of each line (as a string), or an
error. I tweaked this to use a function parse the lines into a provided type:

```go
// Read starts a goroutine that yields lines on the output channel.
func Read[T any](filename string, parser func(c string) (T, error)) (chan Line[T], error) {
```

In this case, the Line now contains the parameterized type instead of a string:

```go
type Line[T any] struct {
    Contents T
    Error    error
}
```

and the Read function simply applies the parser to be able to return the value:

```go
    t, err := parser(strings.TrimSpace(line))
    ch <- Line[T]{Contents: t, Error: err}
```

It's really pleasing to use, at least for int values where `strconv.Atoi`
meets the requirements of a parser function:

```go
// Solution to first part of day 1 of Advent of Code 2020.
func day1a() {
    ch, err := readinp.Read[int]("input.txt", strconv.Atoi)
    if err != nil {
        log.Fatal(err)
    }
    vals := map[int]bool{}
    for line := range ch {
        val, err := line.Contents, line.Error
        if err != nil {
            log.Fatal(err)
        }
        if vals[val] {
            fmt.Printf("%d found, answer is: %d\n", val, val*(2020-val))
            break
        }
        vals[2020-val] = true
    }
}
```

This code can be seen in its entirety at 
[readinp.go](https://github.com/cshabsin/advent/blob/master/commongen/readinp/readinp.go)
and 
[day1.go](https://github.com/cshabsin/advent/blob/master/2020/1/day1.go) on my
Github.

I suspect I'm only scratching the surface of what's possible here, looking
forward to putting this through its paces when the 2021 contest starts.