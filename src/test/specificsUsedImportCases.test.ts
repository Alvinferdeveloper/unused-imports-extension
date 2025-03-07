import * as assert from 'assert';
import { removeUnusedImports } from '../imports';


suite('Extension Test Suite for specifics used import cases', () => {
    
    test('keep usedImports - Angular decorator usage', () => {
        const inputText = `
          import { Component, Injectable } from '@angular/core';
          
          @Component({
            selector: 'app-root',
            template: '<div></div>'
          })
          @Injectable()
          export class AppComponent {}
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });

    test('keep usedImports - Vue template usage', () => {
        const inputText = `
          import { ref, computed } from 'vue';
          import MyComponent from './MyComponent.vue';
    
          export default {
            components: {
              MyComponent
            },
            setup() {
              const count = ref(0);
              const double = computed(() => count.value * 2);
              return { count, double };
            }
          }
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });

    test('keep usedImports - Svelte store usage', () => {
        const inputText = `
          import { writable } from 'svelte/store';
          import { fade } from 'svelte/transition';
    
          const count = writable(0);
          
          <div transition:fade>
            {$count}
          </div>
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });

    test('keep usedImports - Next.js getStaticProps usage', () => {
        const inputText = `
          import { GetStaticProps, GetStaticPaths } from 'next';
          
          export const getStaticProps: GetStaticProps = async () => {
            return { props: {} }
          }
          
          export const getStaticPaths: GetStaticPaths = async () => {
            return { paths: [], fallback: false }
          }
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });

    test('keep usedImports - GraphQL tagged template literals', () => {
        const inputText = `
          import { gql } from 'graphql-tag';
          import { useQuery } from '@apollo/client';
    
          const QUERY = gql\`
            query GetUser {
              user {
                id
              }
            }
          \`;
    
          function Component() {
            const { data } = useQuery(QUERY);
          }
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });

    test('keep usedImports - Styled Components usage', () => {
        const inputText = `
          import styled, { css } from 'styled-components';
          const Button = styled.button\`
            \${css\`
               color: red;
            \`}
          \`;
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });

    test('keep usedImports - Redux/toolkit usage', () => {
        const inputText = `
          import { createSlice, PayloadAction } from '@reduxjs/toolkit';
          import { useSelector, useDispatch } from 'react-redux';
    
          const slice = createSlice({
            name: 'test',
            initialState: {},
            reducers: {
              action: (state, action: PayloadAction<string>) => {}
            }
          });
    
          function Component() {
            const dispatch = useDispatch();
            const state = useSelector(state => state);
          }
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });

    test('keep usedImports - NestJS decorators usage', () => {
        const inputText = `
          import { Controller, Get, Post } from '@nestjs/common';
          import { IsString } from 'class-validator';
    
          class DTO {
            @IsString()
            name: string;
          }
    
          @Controller('api')
          class TestController {
            @Get()
            @Post()
            method() {}
          }
        `;
        const result = removeUnusedImports(inputText);
        assert.strictEqual(result.newLines.trim(), inputText.trim());
        assert.strictEqual(result.unusedImportsPresents, false);
    });
});
