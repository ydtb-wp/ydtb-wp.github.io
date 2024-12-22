#!/usr/bin/env bun
import { askSource, addSource } from "~/actions/addSource";

const source = await askSource();
await addSource(source);
