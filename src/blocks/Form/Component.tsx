'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
  layout?: 'stacked' | 'sideBySide'
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    layout = 'stacked',
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  const isSideBySide = layout === 'sideBySide' && enableIntro && introContent

  return (
    <div className="container relative">
      {/* Decorative background elements */}
      {isSideBySide && (
        <>
          <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        </>
      )}

      <div className={isSideBySide ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start pt-16 pb-20' : 'lg:max-w-[48rem]'}>
        {enableIntro && introContent && !hasSubmitted && layout === 'stacked' && (
          <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
        )}

        {isSideBySide && !hasSubmitted && (
          <div className="lg:sticky lg:top-24 space-y-6">
            <RichText
              className="[&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-bold [&_h2]:mb-4 [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-bold [&_h3]:mb-3 [&_p]:text-base [&_p]:md:text-lg [&_p]:text-foreground/80 [&_p]:leading-relaxed [&_ul]:space-y-2 [&_ul]:text-foreground/80"
              data={introContent}
              enableGutter={false}
            />
          </div>
        )}

        <div className="p-6 lg:p-8 border border-border/40 rounded-xl bg-card/30 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle gradient accent on form card */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />

          <FormProvider {...formMethods}>
            {!isLoading && hasSubmitted && confirmationType === 'message' && (
              <RichText data={confirmationMessage} />
            )}
            {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
            {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
            {!hasSubmitted && (
              <form id={formID} onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 last:mb-0">
                  {formFromProps &&
                    formFromProps.fields &&
                    formFromProps.fields?.map((field, index) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                      if (Field) {
                        return (
                          <div className="mb-6 last:mb-0" key={index}>
                            <Field
                              form={formFromProps}
                              {...field}
                              {...formMethods}
                              control={control}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        )
                      }
                      return null
                    })}
                </div>

                <Button form={formID} type="submit" variant="default">
                  {submitButtonLabel}
                </Button>
              </form>
            )}
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
