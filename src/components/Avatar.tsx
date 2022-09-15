import { ComponentProps } from 'react'
import {ImageProps} from "react-native"
import styled from "styled-components/native"

import { Avatar } from "@/components/uiStyle/atoms"
import {Image, AVATARS_BUCKET} from "@/lib/supabase/"


/***
 * @parm path: image path relative to bucket eg. `image.ext`
 * @param noCache: from `supabase.Image`: disable RN's Image cache
 */
type Props = {
    path: string|null } 
& Pick<ComponentProps<typeof Image>, 'isStale'|'noCache'> 
& ComponentProps<typeof Avatar>;

/***
 * Bucket-aware avartar image component. Only provide `path` relative to bcuket.
 * Renders `atoms.Avatar` that builds support for supabase
 * Wrapper around <supabase.Image/> that actually implements the Supabase integration.
 */

export default styled(Image)<Props>
  .attrs(({path, ...props}) => ({
    path: !!path && `${AVATARS_BUCKET}/${path}`,
    render: ({source, ...p}: ImageProps) => (
      // <Avatar {...{...p, avatar: source && [source.uri]}} />
      <Avatar {...{...p, avatar:  [source.uri]}} />

    ),
    ...props
}))``

