import { ComponentProps, ComponentType } from 'react'
import {ImageProps} from "react-native"
import styled from "styled-components/native"

import { Avatar } from "@/components/uiStyle/atoms"
import {Image, AVATARS_BUCKET} from "@/lib/supabase/"


/***
 * @parm path: image path relative to bucket eg. `image.ext`
 * @param noCache: from `supabase.Image`: disable RN's Image cache
 */
type Props = { path: string|null } 
& Pick<ComponentProps<typeof Image>, 'isStale'|'noCache'> 
& ComponentProps<typeof Avatar>;

/***
 * Supabase bucket-aware avartar image component. 
 * Wrapper around <supabase.Image/> that actually implements the Supabase integration.
 * Renders an `supabase.Image` that renders in turn an `atoms.Avatar`.
 */
export default styled(Image)
  .attrs(({path, ...props}: Props) => ({
    isStale: !!!path,
    path: !!path && `${AVATARS_BUCKET}/${path}`,
    render: ({source, ...p}: ImageProps) => {
      return (
      <Avatar {...{...p, avatar: !!source && [source.uri]}} />
    )},
    ...props
}))``

