/* =========================================================
 * 9. FOOTER
 * ========================================================= */

function codm_register_footer_cpt() {

    register_post_type(
        'codm_footer',
        array(
            'labels' => array(
                'name'          => 'Footer',
                'singular_name' => 'Footer',
                'add_new'       => 'Add Footer',
                'add_new_item'  => 'Add New Footer',
                'edit_item'     => 'Edit Footer',
                'new_item'      => 'New Footer',
                'view_item'     => 'View Footer',
                'search_items'  => 'Search Footer',
                'not_found'     => 'No Footer found',
                'menu_name'     => 'Footer',
            ),

            'public'       => true,
            'show_in_rest' => true,

            'supports' => array(
                'title',
            ),

            'has_archive' => false,

            'rewrite' => array(
                'slug' => 'footer',
            ),

            'show_in_graphql'     => true,
            'graphql_single_name' => 'codmFooter',
            'graphql_plural_name' => 'codmFooters',
        )
    );
}

add_action(
    'init',
    'codm_register_footer_cpt'
);


/* =========================================================
 * FOOTER META BOX
 * ========================================================= */

function codm_footer_metabox() {

    add_meta_box(
        'codm_footer_settings',
        'Footer Settings',
        'codm_footer_metabox_html',
        'codm_footer',
        'normal',
        'high'
    );
}

add_action(
    'add_meta_boxes',
    'codm_footer_metabox'
);


function codm_footer_metabox_html( $post ) {

    wp_nonce_field(
        'codm_save_footer',
        'codm_footer_nonce'
    );

    $description = get_post_meta(
        $post->ID,
        '_codm_footer_description',
        true
    );

    $linkedin = get_post_meta(
        $post->ID,
        '_codm_footer_linkedin',
        true
    );

    $twitter = get_post_meta(
        $post->ID,
        '_codm_footer_twitter',
        true
    );

    $youtube = get_post_meta(
        $post->ID,
        '_codm_footer_youtube',
        true
    );

    $copyright = get_post_meta(
        $post->ID,
        '_codm_footer_copyright',
        true
    );
    ?>

    <p>
        <label>
            <strong>Footer Description</strong>
        </label>
    </p>

    <textarea
        name="codm_footer_description"
        rows="5"
        style="width:100%;"
        placeholder="AI-driven enterprise software solutions built around Salesforce, custom development and intelligent technology."
    ><?php echo esc_textarea( $description ); ?></textarea>


    <hr>

    <h3>Social Links</h3>

    <p>
        <label>
            <strong>LinkedIn URL</strong>
        </label>
    </p>

    <input
        type="url"
        name="codm_footer_linkedin"
        value="<?php echo esc_attr( $linkedin ); ?>"
        placeholder="https://www.linkedin.com/"
        style="width:100%;"
    />

    <p>
        <label>
            <strong>X / Twitter URL</strong>
        </label>
    </p>

    <input
        type="url"
        name="codm_footer_twitter"
        value="<?php echo esc_attr( $twitter ); ?>"
        placeholder="https://x.com/"
        style="width:100%;"
    />

    <p>
        <label>
            <strong>YouTube URL</strong>
        </label>
    </p>

    <input
        type="url"
        name="codm_footer_youtube"
        value="<?php echo esc_attr( $youtube ); ?>"
        placeholder="https://www.youtube.com/"
        style="width:100%;"
    />


    <hr>

    <p>
        <label>
            <strong>Copyright</strong>
        </label>
    </p>

    <input
        type="text"
        name="codm_footer_copyright"
        value="<?php echo esc_attr( $copyright ); ?>"
        placeholder="Copyright © 2025 eMavens"
        style="width:100%;"
    />

    <?php
}


/* =========================================================
 * SAVE FOOTER
 * ========================================================= */

function codm_save_footer( $post_id ) {

    if (
        ! isset( $_POST['codm_footer_nonce'] ) ||
        ! wp_verify_nonce(
            sanitize_text_field(
                wp_unslash(
                    $_POST['codm_footer_nonce']
                )
            ),
            'codm_save_footer'
        )
    ) {
        return;
    }

    if (
        defined( 'DOING_AUTOSAVE' ) &&
        DOING_AUTOSAVE
    ) {
        return;
    }

    if (
        wp_is_post_revision( $post_id ) ||
        wp_is_post_autosave( $post_id )
    ) {
        return;
    }

    if (
        ! current_user_can(
            'edit_post',
            $post_id
        )
    ) {
        return;
    }

    $fields = array(
        'codm_footer_description'
            => '_codm_footer_description',

        'codm_footer_linkedin'
            => '_codm_footer_linkedin',

        'codm_footer_twitter'
            => '_codm_footer_twitter',

        'codm_footer_youtube'
            => '_codm_footer_youtube',

        'codm_footer_copyright'
            => '_codm_footer_copyright',
    );

    foreach ( $fields as $field => $meta_key ) {

        if ( isset( $_POST[ $field ] ) ) {

            update_post_meta(
                $post_id,
                $meta_key,
                sanitize_textarea_field(
                    wp_unslash(
                        $_POST[ $field ]
                    )
                )
            );
        }
    }
}

add_action(
    'save_post_codm_footer',
    'codm_save_footer'
);


/* =========================================================
 * FOOTER GRAPHQL FIELDS
 * ========================================================= */

function codm_register_footer_graphql_fields() {

    $fields = array(
        'description' => '_codm_footer_description',
        'linkedin'    => '_codm_footer_linkedin',
        'twitter'     => '_codm_footer_twitter',
        'youtube'     => '_codm_footer_youtube',
        'copyright'   => '_codm_footer_copyright',
    );

    foreach ( $fields as $graphql_name => $meta_key ) {

        register_graphql_field(
            'CodmFooter',
            $graphql_name,
            array(
                'type'        => 'String',
                'description' => 'Footer ' . $graphql_name,

                'resolve' => function( $post ) use ( $meta_key ) {

                    $post_id = isset( $post->ID )
                        ? $post->ID
                        : $post->databaseId;

                    return get_post_meta(
                        $post_id,
                        $meta_key,
                        true
                    );
                },
            )
        );
    }
}

add_action(
    'graphql_register_types',
    'codm_register_footer_graphql_fields'
);
