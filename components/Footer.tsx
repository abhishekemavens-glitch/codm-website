/* =========================================================
 * 9. FOOTER
 * ========================================================= */

/**
 * Register Footer CPT
 */
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


/**
 * Footer Meta Box HTML
 */
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

    $services = get_post_meta(
        $post->ID,
        '_codm_footer_services',
        true
    );

    $ai_llm = get_post_meta(
        $post->ID,
        '_codm_footer_ai_llm',
        true
    );

    $industries = get_post_meta(
        $post->ID,
        '_codm_footer_industries',
        true
    );

    $company = get_post_meta(
        $post->ID,
        '_codm_footer_company',
        true
    );

    $left_logos = get_post_meta(
        $post->ID,
        '_codm_footer_left_logos',
        true
    );

    $certification_logos = get_post_meta(
        $post->ID,
        '_codm_footer_certification_logos',
        true
    );

    $copyright = get_post_meta(
        $post->ID,
        '_codm_footer_copyright',
        true
    );

    ?>

    <!-- =====================================================
         DESCRIPTION
         ===================================================== -->

    <h2>Footer Description</h2>

    <p>
        <label>
            <strong>Description</strong>
        </label>
    </p>

    <textarea
        name="codm_footer_description"
        rows="5"
        style="width:100%;"
        placeholder="AI-driven enterprise software solutions built around Salesforce, custom development and intelligent technology."
    ><?php echo esc_textarea( $description ); ?></textarea>


    <!-- =====================================================
         SOCIAL LINKS
         ===================================================== -->

    <hr>

    <h2>Social Links</h2>

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


    <!-- =====================================================
         SERVICES
         ===================================================== -->

    <hr>

    <h2>Services Links</h2>

    <p>
        Enter one link per line using:

        <br>

        <code>Label|URL</code>
    </p>

    <textarea
        name="codm_footer_services"
        rows="10"
        style="width:100%;"
        placeholder="Education Cloud|/services/education-cloud&#10;Financial Services|/services/financial-services&#10;API Integration|/services/api-integration"
    ><?php echo esc_textarea( $services ); ?></textarea>


    <!-- =====================================================
         AI & LLM
         ===================================================== -->

    <hr>

    <h2>AI &amp; LLM Links</h2>

    <p>
        <code>Label|URL</code>
    </p>

    <textarea
        name="codm_footer_ai_llm"
        rows="10"
        style="width:100%;"
        placeholder="LLM & Custom AI Development|/ai-llm/llm-custom-ai-development&#10;Business Process Automation|/ai-llm/business-process-automation&#10;Custom Development|/custom-development"
    ><?php echo esc_textarea( $ai_llm ); ?></textarea>


    <!-- =====================================================
         INDUSTRIES
         ===================================================== -->

    <hr>

    <h2>Industries Links</h2>

    <p>
        <code>Label|URL</code>
    </p>

    <textarea
        name="codm_footer_industries"
        rows="8"
        style="width:100%;"
        placeholder="Financial Services|/industries/financial-services&#10;Healthcare & Insurance|/industries/healthcare-insurance&#10;Manufacturing|/industries/manufacturing"
    ><?php echo esc_textarea( $industries ); ?></textarea>


    <!-- =====================================================
         COMPANY
         ===================================================== -->

    <hr>

    <h2>Company Links</h2>

    <p>
        <code>Label|URL</code>
    </p>

    <textarea
        name="codm_footer_company"
        rows="10"
        style="width:100%;"
        placeholder="About|/about&#10;White Label Programme|/white-label-programme&#10;Case Studies|/case-studies&#10;Career|/career&#10;Contact|/contact&#10;Blogs|/blogs"
    ><?php echo esc_textarea( $company ); ?></textarea>


    <!-- =====================================================
         LEFT LOGOS
         ===================================================== -->

    <hr>

    <h2>Footer Logos</h2>

    <p>
        Add one image URL per line.
    </p>

    <p>
        These are the logos displayed underneath the description.
    </p>

    <textarea
        name="codm_footer_left_logos"
        rows="6"
        style="width:100%;"
        placeholder="/wp-content/uploads/salesforce.png&#10;/wp-content/uploads/government.png&#10;/wp-content/uploads/google-cloud.png&#10;/wp-content/uploads/iso.png"
    ><?php echo esc_textarea( $left_logos ); ?></textarea>


    <!-- =====================================================
         CERTIFICATION LOGOS
         ===================================================== -->

    <hr>

    <h2>Certification / Trust Logos</h2>

    <p>
        Add one image URL per line.
    </p>

    <p>
        These are the logos displayed on the right side of the footer.
    </p>

    <textarea
        name="codm_footer_certification_logos"
        rows="6"
        style="width:100%;"
        placeholder="/wp-content/uploads/omnistudio.png&#10;/wp-content/uploads/srp.png&#10;/wp-content/uploads/3score.png&#10;/wp-content/uploads/cyber-essentials.png"
    ><?php echo esc_textarea( $certification_logos ); ?></textarea>


    <!-- =====================================================
         COPYRIGHT
         ===================================================== -->

    <hr>

    <h2>Copyright</h2>

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
        ! isset( $_POST['codm_footer_nonce'] )
    ) {
        return;
    }

    if (
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


    /*
     * Text fields
     */
    $text_fields = array(

        'codm_footer_description'
            => '_codm_footer_description',

        'codm_footer_linkedin'
            => '_codm_footer_linkedin',

        'codm_footer_twitter'
            => '_codm_footer_twitter',

        'codm_footer_youtube'
            => '_codm_footer_youtube',

        'codm_footer_services'
            => '_codm_footer_services',

        'codm_footer_ai_llm'
            => '_codm_footer_ai_llm',

        'codm_footer_industries'
            => '_codm_footer_industries',

        'codm_footer_company'
            => '_codm_footer_company',

        'codm_footer_left_logos'
            => '_codm_footer_left_logos',

        'codm_footer_certification_logos'
            => '_codm_footer_certification_logos',

        'codm_footer_copyright'
            => '_codm_footer_copyright',
    );


    foreach (
        $text_fields as $field => $meta_key
    ) {

        if (
            isset( $_POST[ $field ] )
        ) {

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
 * FOOTER GRAPHQL
 * ========================================================= */

function codm_register_footer_graphql_fields() {

    $fields = array(

        'description'
            => '_codm_footer_description',

        'linkedin'
            => '_codm_footer_linkedin',

        'twitter'
            => '_codm_footer_twitter',

        'youtube'
            => '_codm_footer_youtube',

        'services'
            => '_codm_footer_services',

        'aiLlm'
            => '_codm_footer_ai_llm',

        'industries'
            => '_codm_footer_industries',

        'company'
            => '_codm_footer_company',

        'leftLogos'
            => '_codm_footer_left_logos',

        'certificationLogos'
            => '_codm_footer_certification_logos',

        'copyright'
            => '_codm_footer_copyright',
    );


    foreach (
        $fields as $graphql_name => $meta_key
    ) {

        register_graphql_field(
            'CodmFooter',
            $graphql_name,
            array(

                'type' => 'String',

                'description' =>
                    'Footer ' . $graphql_name,

                'resolve' =>
                    function( $post )
                    use ( $meta_key ) {

                        $post_id =
                            isset( $post->ID )
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
